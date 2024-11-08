// remote_team_tab.js, by: dhirajbajaj

	// ---------------------------------------------------------
	//  TASKS: todos - upcoming tasks, dones - completed tasks
	// ---------------------------------------------------------

	// {  
	// 		id: 12,  
	// 		project_name: "<ProjectName>",  
 	// 		task_text: "track all todos in cloudfare, it will log with unique id",  
	// 		task_time: "Mar 11, 2:34 AM",  
	// }  

	// Global TODOS and DONES array 
	let TODOS = [], DONES = [], PROJECT_NAME = 'Untitled';

	commit = function(key_name, data){ 
		// key_name : "todos" or "dones" 
		chrome.storage.sync.set( { [key_name]: JSON.stringify(data) }, function() { 
			// console.log(key_name + " data saved! " + JSON.stringify(data)); 
			refresh_todo_view();
		}); 
	} 

	commit_todos = function(){ 
		commit("todos", TODOS); 
	}

	commit_dones = function(){ 
		commit("dones", DONES); 
	}


	// load TODOS, DONES 
	init_todos_dones = function(){ 
		chrome.storage.sync.get( "project_name", function(result) {
			if( result.project_name) {
				PROJECT_NAME = result.project_name;
			}
			$("#project_name").text(PROJECT_NAME);
		});

		chrome.storage.sync.get([ "todos", "dones" ], function(result) {
			if( result.todos && result.dones ) {
				// console.log('todos/dones exist');
				TODOS = JSON.parse(result.todos); 
				DONES = JSON.parse(result.dones); 
				refresh_todo_view(); 
			}
			else{
				TODOS = [{
	        id: 1,
		 			task_text: "Edit this Current task", 
					task_time: get_current_time()
	  		},{
	        id: 2,
		 			task_text: "add future tasks here",
					task_time: get_current_time()
	  		}];
				DONES = [{
	        id: 1,
		 			task_text: "\xa0Last completed task\xa0", 
					task_time: get_current_time()
	  		}];
				commit_todos();
				commit_dones(); 
			} 
		});
	};

	// add todo
	add_todo = function(){
	  var task=prompt("Add upcoming tasks here...","Upcoming tasks");
	  if (task!=null){
	  	var todo = {
        id: TODOS.length > 0 ? TODOS[TODOS.length - 1].id + 1 : 1,
	 			task_text: task, 
				task_time: get_current_time()
	  	};
      TODOS.push(todo);
      commit_todos();
	  }
	}

	// edit todo text
	edit_todo = function(){
		if(TODOS.length>0){
			let currtask = $("#current_task").text();
		  var task=prompt("Edit! Your current task description...", currtask);
		  if (task!=null){
		  	TODOS[0].task_text = task;
		  	commit_todos();
		 }
		}
		else{
			add_todo();
		}
	}

	// complete btn binding
	complete_todo = function(){
		if(TODOS.length==0){return};
		var r = confirm("Sure?");
		if (r == true) {		
			var last_task = TODOS.shift();
			last_task.id = (DONES.length > 0 ? DONES[0].id + 1 : 1);

			if(TODOS.length>0){
				TODOS[0].task_time = get_current_time();
			}
			commit_todos();
			DONES.unshift(last_task);
			commit_dones();
		}
	}

	// refresh the todo block view
	refresh_todo_view = function(){
		
		chrome.storage.sync.get(['sleep_status', 'break_status'], function(result) {
	    if(result.break_status===1){
	    	$("#active_tasks").hide();
			$("#project_box").hide();
			$("#break_block").show();
	    }
	    if(result.sleep_status===1){
	    	$("#active_tasks").hide();
			$("#project_box").show();
			$("#sleep_block").show();
	    }
	  });
    if(TODOS.length>1){
    	var task_count = TODOS.length - 1;
		var next_tasks = "<h3>" + task_count + " upcoming task(s)</h3><ul>";
    	for(var i=1; i<TODOS.length; i++){
    		next_tasks += "<li>" + TODOS[i].task_text + "</li>";
    	}
    	next_tasks += "</ul>";
    	$("#upcoming_task").html(next_tasks);
    }else{
    	$("#upcoming_task").text("");
    }

		if(TODOS.length>0){
			$("#current_task").text(TODOS[0].task_text);
			$("#current_task_time").text(TODOS[0].task_time);
		}else{
			$("#current_task").text("All tasks completed");
			$("#current_task_time").text(get_current_time());
		}
		if(DONES.length>0){
			var last_task = "\xa0\xa0" + DONES[0].task_time + ": " + DONES[0].task_text + "\xa0\xa0";
    	$("#last_task").text(last_task);
		}else{
    	$("#last_task").text("-");
		}    
	}

	// --------------- ENDOF: TODOS
	// --------------- SET PROJECT_NAME

	// set_project_name
	set_project_name = function(){
	  var p_name=prompt("Set your project name here...", $("#project_name").text());
	  if (p_name!=null){
			// p_name
			chrome.storage.sync.set({"project_name": p_name });
			PROJECT_NAME = p_name;
			$("#project_name").text(PROJECT_NAME);
	  }
	}




	// --------------- TIME
	get_current_time = function(){
		var d = new Date($.now());
	  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "June", "July", "Aug", "Sep", "Oct", "Nov", "Dec"];
		var currentHours = d.getHours();
		var timeOfDay = ( currentHours < 12 ) ? "AM" : "PM";
  	currentHours = ( currentHours > 12 ) ? currentHours - 12 : currentHours;
	 	currentHours = ( currentHours == 0 ) ? 12 : currentHours;
		var current_time = monthNames[d.getMonth()]+" "+("0" + d.getDate()).slice(-2)+", "+ currentHours + ":"+("0" + d.getMinutes()).slice(-2) + " " + timeOfDay;
		return current_time;
	}


	getWeather = function(lat, lon){
		let url = "http://api.openweathermap.org/data/2.5/weather?lat="+lat+"&lon="+lon+"&units=metric&APPID=4deb9177a8586ecba55c1fb575418300"


		$.get(url, function (data) {
			// let icon = <img src="http://openweathermap.org/img/wn/"+data.weather[0].icon+"@2x.png" />
		}).done(function(data) {
			$("#weather").html( data.name + ", " + data.weather[0].main +", "+data.main.temp + " &#176;C");
			// chrome.storage.local.set( { "unsplash_author_href" : href_link, "unsplash_author_name" : data.user.name } );
	  })
	  .fail(function() {
	  });

	}

	// Locations
	userLocation = function(){

		var options = {
		  enableHighAccuracy: true,
		  timeout: 5000,
		  maximumAge: 0
		};

		function success(pos) {
		  var crd = pos.coords;
		  console.log('Your current position is:');
		  console.log(`Latitude : ${crd.latitude}`);
		  console.log(`Longitude: ${crd.longitude}`);
		  console.log(`More or less ${crd.accuracy} meters.`);
		  // 15 km accuracy allowed for weather
		  if(crd.accuracy<15000){
		  	getWeather(crd.latitude,crd.longitude);
		  }
		}

		function error(err) {
		  console.warn(`ERROR(${err.code}): ${err.message}`);
		}

		navigator.geolocation.getCurrentPosition(success, error, options);
	}


	// Clock 
	updateClock = function(){
	 	setInterval(function(){
		   $("#clock").html(get_current_time());
		},1000);

	}

	// ------------------
	//  Background Image 
	// ------------------
	saveImageToBlob = function( url ){
	    var imgxhr = new XMLHttpRequest();
      imgxhr.open( "GET", url + "?" + new Date().getTime() );
      imgxhr.responseType = "blob";
      imgxhr.onload = function (){
          if ( imgxhr.status===200 ){
              reader.readAsDataURL(imgxhr.response);
          }
      };
	    var reader = new FileReader();
      reader.onloadend = function () {
        // document.getElementById( "image" ).src = reader.result;
        $('#imagebackground').css("background-image", "url(" + reader.result + ")").animate({opacity: 1},{duration:1000});
        chrome.storage.local.set( { "unsplash_image_blob" : reader.result, "unsplash_image_time" : $.now(), "unsplash_image_url" : url } );
      };
	    imgxhr.send();
	}

	newBackgroundImage = function() {
		const unsplashUrl = "https://api.unsplash.com/photos/random?client_id=1p44LC8FqWf2d_d0UpBo4dV8JFQPnNq7r7iHMXhSjw0&collections=317099&orientation=landscape&featured=true";

		$.get(unsplashUrl, function(data) {
			saveImageToBlob(data.urls.regular);
		}).done(function(data) {
			const authorHref = `https://unsplash.com/@${data.user.username}?utm_source=one_task_at_a_time&utm_medium=referral`;
			$("#photo_by").attr("href", authorHref).text(data.user.name);
			chrome.storage.local.set({
				unsplashAuthorHref: authorHref,
				unsplashAuthorName: data.user.name,
				unsplashDesc: data.description,
			});
		}).fail(function() {
			// Quota limit reached
			saveImageToBlob("https://source.unsplash.com/featured/?art");
		});
	};
 
 	load_background_image = function(){

	 	chrome.storage.local.get( ["unsplash_image_time"], function(result) {
		    var milli = $.now() - result.unsplash_image_time;
		    var minutes = Math.floor((milli / (60 * 1000)) % 60);
		    if(minutes>=30){
		    	newBackgroundImage();
		    	return true;
		    }
	  });

	 	chrome.storage.local.get( ["unsplash_image_blob", "unsplash_author_href", "unsplash_author_name", "unsplash_image_url", "unsplash_desc"], function(result) {
		  // console.log('Current task value ' + result.current_task);
			$('#imagebackground').css("background-image", "url(" + result.unsplash_image_blob + ")").animate({opacity: 1},{duration:500});
			$("#photo_by").attr("href", result.unsplash_author_href).text(result.unsplash_author_name);
			$("#photo_file").attr("href", result.unsplash_image_url);
			if(result.unsplash_desc){
				$("#photo_desc").text(result.unsplash_desc);
			}
	  });
 	}

	// -------------------
	//  Quotes of the day 
	// -------------------
	load_qod = function(){
		var url = "http://quotes.rest/qod.json";
		var quote = $("#quote");
		
		$.get(url, function (data) {
			var the_quote = data;
			quote.text("\"" + the_quote.contents.quotes[0].quote + "\" - " + the_quote.contents.quotes[0].author);
		});
	}

	// ------------
	//  Background 
	// ------------
	function loadTaskBackground() {
		const backgroundColors = [
			"#181717", "#212121", "#263238", "#222831", "#010101", "#232931", "#353941", "#1b262c", "#040410"
		];

		const randomColor = backgroundColors[Math.floor(Math.random() * backgroundColors.length)];
		const [r, g, b] = randomColor.slice(-6).match(/\w{2}/g).map(x => parseInt(x, 16));
		const rgbaColor = `rgba(${r}, ${g}, ${b}, 0.05)`;

		$("#current_taskblock, #break_block, #sleep_block").css("background-color", rgbaColor);
	}

	function displayConsoleMessage() {
    console.log(
        `"One task at a time" is a simple Chrome new tab extension, ` +
        `that syncs across all your devices. ` +
        `Noise on the Internet is overwhelming and distracting. ` +
        `Thus, I created this basic tool for developers like you and me. ` +
        `Connect with me on https://www.linkedin.com/in/bajajdhiraj/. ` +
        `DM me suggestions or collaboration requests.`
    )};


	function loadPicsumPhotos() {
		chrome.storage.local.get(["picsum_image_url","picsum_image_time"]).then((result) => {
		    console.log('chrome.storage.local : ' + result.picsum_image_time);
		    if (!result.picsum_image_time) {
		        setPicsumPhotos();
		    } else{
				var milli = $.now() - result.picsum_image_time;
				var minutes = Math.floor((milli / (60 * 1000)) % 60);
				if(minutes>=30){
					setPicsumPhotos();
				}else{
					$('#imagebackground').css("background-image", result.picsum_image_url).animate({opacity: 1}, {duration: 1000});
					$("#photo_by").attr("href", 'https://picsum.photos').text('picsum.photos');
					$("#photo_file").attr("href", result.picsum_image_url);					
				}
			}
	  	});

	}

	function setPicsumPhotos() {
		let picsum_url = "https://picsum.photos/1920/1080";
		$('#imagebackground').css("background-image", `url(${picsum_url})`).animate({opacity: 1}, {duration: 1000});
		$("#photo_by").attr("href", 'https://picsum.photos').text('picsum.photos');
		$("#photo_file").attr("href", picsum_url);
		// set this when image loads, save the background url of image to local storage	 
		$('#imagebackground').on('load', function() {
			let picsum_loaded_url = $('#imagebackground').css("background-image");
			chrome.storage.local.set({ "picsum_image_url": picsum_loaded_url, "picsum_image_time": $.now() }).then(() => {
				console.log("picsum_image_url, picsum_image_time is set");
			});
			  
		});
		return true;
	}


	// Actions btn bindings 
	$("#project_box").on('click',function () {
		// add_new_task();
		set_project_name();
	});

	$("#add_btn").on('click',function () {
		// add_new_task();
		add_todo();
	});

	$("#edit_btn").on('click',function () {
		edit_todo();
	});

	$("#complete_btn").on('click',function () {
		complete_todo();
	});

	$("#break_btn").on('click',function () {
		chrome.storage.sync.set({"break_status": 1}, function() {
			$("#active_tasks").hide();
			$("#project_box").hide();
			$("#break_block").show();			
		});
	});

	$("#exit_break_btn").on('click',function () {
		chrome.storage.sync.set({"break_status": 0}, function() {
			$("#break_block").hide();
			$("#active_tasks").show();
			$("#project_box").show()
		});

	});

	$("#sleep_btn").on('click',function () {
		chrome.storage.sync.set({"sleep_status": 1}, function() {
			$("#active_tasks").hide();
			$("#sleep_block").show();			
		});
	});

	$("#exit_sleep_btn").on('click',function () {
		chrome.storage.sync.set({"sleep_status": 0}, function() {
			$("#sleep_block").hide();
			$("#active_tasks").show();
		});

	});

	$("#photo_file").on('click',function (e) {
		e.preventDefault();
		$('#content').fadeOut(500);
		$('#filter').fadeOut(100);
	});

	$("#imagebackground").on('click',function () {
		$('#content').fadeIn();
		$('#filter').fadeIn();
	});



	$(function(){
		
		userLocation();
		init_todos_dones();
		loadTaskBackground();

		// load_background_image();
		loadPicsumPhotos();
		updateClock();
		// load_qod();
		
		// console_msg();

	});


