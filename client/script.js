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
	
	//Sounds
	var $placeSound = $("#place-sound");
	var $buttonSound = $("#button-sound");
	
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
	socket.on("place", function(data) { //When someone places a marker
		$playfield.find(".layer:eq(" + data.z + ")").find("tr:eq(" + data.y + ")").find("td:eq(" + data.x + ")").find(".button").removeClass("preview").addClass(data.type);
	});
	socket.on("reset", function(data) {
		$playfield.find(".button").removeClass("circle");
		$playfield.find(".button").removeClass("cross");
	});
	socket.on("sound", function(data) {
		$("#"+data).get(0).play();
	});
	
	$buttons.click(function() { //When a button is clicked
		socket.emit("place", { x: $(this).parents("td").index(), y: $(this).parents("tr").index(), z: $(this).parents(".layer").index() });
	});
	$buttons.hover(function(){
		if(!$(this).hasClass("cross") && !$(this).hasClass("circle"))
		{
			$(this).toggleClass("preview");
		}
	});
});