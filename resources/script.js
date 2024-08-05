let words = [];
let word_index = 0;

const file_input       = document.getElementById("file-input");
const file_load_button = document.getElementById("load-file-button");
const file_load_label  = document.getElementById("file-label");

const text_field = document.getElementById("word-box");
const total_words_display = document.getElementById("total-words");
const wpm_input = document.getElementById("wpm-input");
wpm_input.value = 0;

const toggle_spritz_button = document.getElementById("toggle-button");
const reset_button = document.getElementById("reset-button");
let spritz_active  = false;
let spritz_loop_id = null;

const reading_est = document.getElementById("reading-estimate");
const word_index_input = document.getElementById("word-index");
const show_word_index_button = document.getElementById("show-word-index")
const prev_word_index_button = document.getElementById("prev-word-index");
const next_word_index_button = document.getElementById("next-word-index");

/* 
Loading file and creating word array
*/

function create_word_array(s) {
	let words;

	s = s.replace(/\r|\n/g, " "); // regex expression to remove specific characters
	s = s.replace(/—/g, " — ") // making em-dashed easier to reader
	s = s.replace(/ -/g, ""); // removing hyphens from our text
	words = s.split(" "); // split everything into words
	words = words.filter(w => w != ""); // removing blank words
	return words
};

function remove_blank_words(word_array) {
	return word_array.filter(w => w != "");
};

function update_file_label(file_loaded=true) {
	if (file_loaded) {
		file_load_label.innerText = "(file loaded)";
	};
};

function load_file() {
	let file = file_input.files[0];
	let reader = new FileReader();
	
	// asynchronous action
	reader.readAsText(file);

	reader.onload = () => {
		text = reader.result;
		words = create_word_array(text); // Splitting and saving our words
		update_file_label(file_loaded=true);

		console.log("Text successfully retrieved!");
		set_total_words_display();
	};
	reader.onerror = () => {
		console.log(reader.error);
	};
};

/*
Spritz Buttons
*/

function update_word_index_input() {
	word_index_input.value = word_index;
}

function wpm_2_delay(wpm) {
	const ms_in_min = 60_000; // milliseconds in a minute
	return (1 / wpm) * ms_in_min;
};

function wpm_input_2_delay() {
	wpm = parseInt(wpm_input.value);
	return wpm_2_delay(wpm);
};

function highlight_wpm_input() {
	// Called when we try to start the Spritz without havin a WPM
	wpm_input.style.outline = "2px solid red";
}

function remove_wpm_input_highlight() {
	// Called when we start the Spritz with a valid WPM
	wpm_input.style.outline = "none";
}

// Helper function for increment/decrement_wpm
function update_wpm_input_value(wpm) {
	wpm_input.value = wpm;
	console.log(wpm_input.value);
}


// Used for testing if the WPM input is valid
function value_is_int(value) {
	if (value == '') {
		return false;
	} else if (parseInt(value) == NaN) {
		// Input isn't a valid number
		return false;
	}
	return true;
}

function show_word(index) {
	text_field.innerText = words[index];
};

function set_total_words_display() {
	total_words_display.innerHTML = `Total words: ${words.length}`;
}

function start_spritz_loop(delay) {
	if (words.length == 0) {
		// Showing the user an error
		text_field.innerHTML = "Load data first!";
		text_field.style.color = "maroon";

	} else if (!value_is_int(wpm_input.value)) {
		highlight_wpm_input();

	} else {
		remove_wpm_input_highlight();

		spritz_loop_id = setInterval(() => {
			show_word(word_index++);
		}, delay); // delay is in milliseconds 

		spritz_active = true;
	}
};

function stop_spritz_loop(reset_index=false) {
	if (spritz_loop_id == null) {
		console.log("Loop hasn't start yet");

	} else {
		clearInterval(spritz_loop_id);

		if (reset_index) {
			word_index = 0;
			show_word(word_index);
		};
	};
	spritz_active = false;
};

function word_index_is_valid() {
	return value_is_int(word_index_input.value);
}

// Changes the word in the display to the one
// in the word_index_input box
function go_2_word_index() {
	word_index = word_index_input.value;
	show_word(word_index);
}

// Called when the backward arrow-key is pressed
function decrement_word_index() {
	word_index--;
	update_word_index_input();
	show_word(word_index);
}

// Called when the forward arrow-key is pressed
function increment_word_index() {
	word_index++;
	update_word_index_input();
	show_word(word_index);
}

/*
File data info
*/

function minutes_2_read(wpm, num_words) {
	return num_words / wpm;
}

function minutes_to_hms(minutes) {
	// hms := hours, minutes seconds
	let hms = new Array;

	let h = Math.floor(minutes / 60);
	let m = Math.floor(minutes % 60);
	let s = Math.floor(((minutes % 60) - m) * 60);

	hms.push(h, m, s);
	return hms;
}

function update_time_estimate_dsplay() {
	if (value_is_int(wpm_input.value)) {
		let wpm = parseInt(wpm_input.value);
		console.log(wpm)
		let minutes = minutes_2_read(wpm, words.length);
		console.log(minutes)
		let hms = minutes_to_hms(minutes);
		console.log(hms);

		let h = hms[0];
		let m = hms[1];
		let s = hms[2];

		console.log(h);
		console.log(m);
		console.log(s);
		reading_est.innerHTML = `Time to read piece at this rate: ${h}h ${m}m ${s}s`;
	}
}

////////// (eventListener functions)

function toggle_button_clicked() {
	if (spritz_active) {
		// To change our wpm speed, we first need to stop our setInterval()
		stop_spritz_loop();
		toggle_spritz_button.innerHTML = "Start Spritz";
	} else {
		start_spritz_loop(delay=wpm_input_2_delay());

		if (spritz_active) {
			// Spritz won't activate data isn't loaded yet.
			toggle_spritz_button.innerHTML = "Stop Spritz";
		}
	};
};

function reset_button_clicked() {
	stop_spritz_loop(reset_index=true);
};

// Updates the text-box even if it is running
function update_spritz_in_motion() {
	if (spritz_active) {
		stop_spritz_loop();

		if (!spritz_active) {
			// Don't want to start the Spritz until the prev. one is stopped
			start_spritz_loop(delay=wpm_input_2_delay());
		}
	};
}

// Called when the up arrow-key is called
function increment_wpm() {
	console.log("up arrow");
	update_wpm_input_value(++wpm_input.value);
	update_spritz_in_motion();
}

// Called when the down arrow-key is called
function decrement_wpm() {
	console.log("down arrow");
	if (wpm_input.value > 0) {
		update_wpm_input_value(--wpm_input.value);
		update_spritz_in_motion();
	}
}

/* 
Event listeners
*/

toggle_spritz_button.addEventListener("click", toggle_button_clicked);
reset_button.addEventListener("click", reset_button_clicked);

wpm_input.addEventListener("keydown",  (event) => {
	if (event.key == "Enter") {
		update_time_estimate_dsplay();
	};
});
word_index_input.addEventListener("keydown", () => {
	if (word_index_is_valid()) {
		go_2_word_index();
	};
});
show_word_index_button.addEventListener("click", update_word_index_input);
prev_word_index_button.addEventListener("click", decrement_word_index);
next_word_index_button.addEventListener("click", increment_word_index);

file_load_button.addEventListener("click", load_file);

document.addEventListener("keydown", (event) => {
	// Toggling the Spritz using the space bar
	switch (event.key) {
		// Space Bar
		case " ":
			update_time_estimate_dsplay();
			toggle_button_clicked();
			break;

		case "ArrowLeft":
			decrement_word_index();
			break;
		case "ArrowRight":
			increment_word_index();
			break;

		case "ArrowDown":
			decrement_wpm();
			break;
		case "ArrowUp":
			increment_wpm();
			break;
	};
});