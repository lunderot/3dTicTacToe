jQuery(function($){
	var socket = io.connect();
	var $messageForm = $("#send-message");
	var $messageBox = $("#message");
	var $chat = $("#chat");
	var $buttons = $(".button");
	
	var $loginForm = $("#login");
	var $nicknameBox = $("#nickname");
	
	var $playfield = $("#playfield");
	var $chatfield = $("#chatfield");
	
	$messageForm.submit(function(e){ //When the user submits a message
		e.preventDefault();
		socket.emit("chatmessage", $messageBox.val());
		$messageBox.val("");
	});
	$loginForm.submit(function(e){
		e.preventDefault();
		socket.emit("clientinfo", { nickname: $nicknameBox.val() });
		$loginForm.hide();
		$playfield.show();
		$chatfield.show();
	});
	
	
	socket.on("chatmessage", function(data){ //When a chat message is recived
		$chat.append($('<i></i>').text(data).html() + "<br/>");
		$chat.scrollTop($chat[0].scrollHeight);
	});
	socket.on("update", function(data) {
		var mask = parseInt("000000000000000000000000001", 2);
		$(".button").each(function(index) {
			if((data.data & mask) == mask) {
				$(this).addClass(data.type);
			}
			mask = mask << 1;
		});
		$(".score." + data.type).text(data.score.toString());
	});
	socket.on("reset", function(data) {
		$playfield.find(".button").removeClass("circle");
		$playfield.find(".button").removeClass("cross");
	});
	socket.on("sound", function(data) {
		$("#"+data).get(0).play();
	});
	
	$buttons.click(function() { //When a button is clicked
		var data = 1 << $(this).index(".button");
		socket.emit("place", data);
		//socket.emit("place", { x: $(this).parents("td").index(), y: $(this).parents("tr").index(), z: $(this).parents(".layer").index() });
	});
});