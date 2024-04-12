var DEFAULT_SONG_TITLE = "My Great Song";
var COLOURS = {
	"MAJOR"            : "M",
	"MINOR"            : "m",
	"DIMINISHED"       : "dim",
	"ADD9"             : "add9",
	"ADD13"            : "add13",
	"MAJOR7"           : "M7",
	"MINOR7"           : "m7",
	"SEVEN"            : "7",
	"DIMINISHEDSEVEN"  : "dim7",
	"SIX"              : "6",
	"NINE"             : "9"
}

var scale = [
//____1____ ____2____ ____3____ ____4____ ____5____  6   7   8   9  10  11  12
  "C#","Db","D#","Eb","F#","Gb","G#","Ab","A#","Bb","C","D","E","F","G","A","B"
];

    /*  s6   0    1      2     3     4      5 */
var	pref = ["E", "F", "F#Gb", "G", "G#Ab", "A",
    /*        6      7    8     9     10    11
    /*  s5    1      2    3     4      5     6  */
	        "A#Bb", "B", "C", "C#Db", "D", "D#Eb"];

/**
 */
function chordColour(chord) {
	//C#dim C7 D D#add9 Ebadd13 B
	//if there is just one note, easy, return major
	if(chord.length == 1){
		return { note: chord, colour: COLOURS.MAJOR };
	} else if (chord.length == 2 && (chord.substring(1) == "#" || chord.substring(1) == "b")){
		return { note: chord, colour: COLOURS.MAJOR };
	}

	//The first character should always be a note
	var baseNote = chord.substring(0,1);
	var modifier = chord.substring(1,2);
	if(modifier == "#" || modifier == "b") {
		baseNote += modifier;
	}
	var colourRequest = chord.substring(baseNote.length);
	
	return { note: baseNote, colour: colourRequest };
}

/**
 */
function chordToClass(note) {
	var arrayPos = null;
	var stringNum = 0;
	var fretNum = 0;

	if(note.length == 0) {
		return null;
	}

	//find the position in the pref array the note 
	//can be found in. From there we can get the
	//string and fret number we prefer
	for(var q=pref.length-1; q>=0; q--) {
		if(note.length == 1) {
			if(pref[q] == note) {
	            arrayPos = q;
	            break;
			}
		} else {
			if(pref[q].indexOf(note) >= 0) {
	            arrayPos = q;
	            break;
			}
		}
	}
	   
	//pick which string we prefer
	if(arrayPos <= 5) stringNum = 6;
	else stringNum = 5;

	//frets are a bit harder...
	if(arrayPos == 5) fretNum = 5;
	else if(arrayPos == 10) fretNum = 5;
	else if(arrayPos == 11) fretNum = 6;
	else fretNum = arrayPos % 5;

	return {
		"stringNum": stringNum,
		"fretNum": fretNum
			}
}

/**
 */	
function createSection(title) {
	var newSection = document.createElement("DIV");
	newSection.setAttribute("class","section");
	var sectionTitle = document.createElement("H2");
	sectionTitle.appendChild(document.createTextNode(title));
	newSection.appendChild(sectionTitle);
	return newSection;
}

/**
 */
function addChord(section, stringAndFret, chordAndColour) {
	var chord = document.createElement("DIV");
	chord.setAttribute("class","chord");

	var note = document.createElement("DIV");
	note.setAttribute("class","note");
	note.appendChild(document.createTextNode(
											 chordAndColour.note + "" + 
											 ( (chordAndColour.colour == COLOURS.MAJOR) ? "" : chordAndColour.colour )
											 ));

	var wrapper = document.createElement("DIV");

	var fret = document.createElement("DIV");
	fret.setAttribute("class","fret");
    if(chordAndColour.note.indexOf("x") != 0)
		fret.appendChild(document.createTextNode(stringAndFret.fretNum));

	var chordDisplay = document.createElement("DIV");
	chordDisplay.setAttribute(
							  "class",
							  "chordbox c" + chordAndColour.colour + "_" + stringAndFret.stringNum
							  );

	chord.appendChild(note);
	wrapper.appendChild(fret);
	wrapper.appendChild(chordDisplay);
	chord.appendChild(wrapper);
   
	section.appendChild(chord);
}

function refreshDisplay() {
	$("#mainDisplay").empty();
	var song = $("#songArea").val();
	
	//split song into individual chords
	var eachLine = song.split("\n")
	for(var q=0; q<eachLine.length; q++){
		var titleAndChords = ["", eachLine[q]];
		var title = "";

		if(eachLine[q].indexOf(":") >= 0) {
			titleAndChords = eachLine[q].toString().split(":");
			title = titleAndChords[0];
		}

		var section = createSection(title);
		$("#mainDisplay").append(section);

		var chords = titleAndChords[1].toString().trim().split(" ");
		for(var z=0; z<chords.length; z++) {

			//@todo break the cord apart to find the cord colour
			var chordAndColour = chordColour(chords[z]);

			if(chordAndColour){
				//find our preferred pos for the barre cord
				var stringAndFret = chordToClass(chordAndColour.note);

				if(stringAndFret != null) {
					addChord(section, stringAndFret, chordAndColour);
				}
			}
		}
		var clearBoth = document.createElement("DIV");
		clearBoth.setAttribute("style","clear:both");
		section.appendChild(clearBoth);
	}
}

////////////////////////////////////////////////////////////////////////////////////////////////

var db;

/**
 * Simple hashing function to get a pk. Probably
 * overkill for this, but fun.
 */
function idHash(str) {
	//alert(str.length)
	var keyPart = str[0] + str[str.length-1>>1] + str[str.length-1]

	var b = 11; //378551;
	var a = 13; //63689;
	var hash = 0;
	for(var i = 0; i < keyPart.length; i++) {
		hash = hash * a + keyPart.charCodeAt(i); //String.charCode(str[i]);
		a = a * b;
	}
	return (hash & 0x7FFFFFFF);
}

function opendb() {
	db = openDatabase("GuitarNotes", "0.1", "Guitar chord notes for songs.", 20000);
	if(!db)
		alert("Whoa, sorry.  I couldn't create the song database.  Are you using a current browser?");
}

function createSchema() {
	db.transaction(function(tx) {
		tx.executeSql(
			"SELECT COUNT(*) FROM Songs", [], null,
			function(tx, error) {
				tx.executeSql(
					"CREATE TABLE Song (id REAL UNIQUE, title TEXT, song TEXT, timestamp REAL)", [], 
					function(tx) {
						loadDefaultData();
					}, null
				);
			}
		);
	});
}

function createSong(title, song) {
	db.transaction(
		function(tx) {
			tx.executeSql(
				"INSERT INTO Song (id, title, song, timestamp) values(?, ?, ?, ?)", 
				[idHash(title), title, song, new Date().getTime()], 
				null, null
			);
		}
	);
}

function updateSong(id, title, song) {
	db.transaction(
		function(tx) {
			tx.executeSql(
				"UPDATE Song set title = ?, song = ?, timestamp = ? WHERE id = ?", 
				[title, song, new Date().getTime(), id], 
				null, null
			);
			refreshDisplay();
		}
	);
}

function createSongList() {
	db.transaction(
		function(tx) {
			tx.executeSql("SELECT id, title FROM Song ORDER BY timestamp", [],
			function(tx, result) {
				for(var i = 0; i < result.rows.length; i++) {
					addItemToSongList(
						result.rows.item(0)['id'], 
						result.rows.item(0)['title']
					);
					//document.write('<b>' + result.rows.item(i)['label'] + '</b><br />');
				}
			}, null);
		}
	);
}

function loadSong(id) {
	db.transaction(
		function(tx) {
			tx.executeSql("SELECT id, title, song FROM Song WHERE id = ?", [id],
			function(tx, result) {
				displaySong(
					result.rows.item(0)['id'], 
					result.rows.item(0)['title'], 
					result.rows.item(0)['song']
				);
			}, null);
		}
	);
}

function removeSongFromDatabase(id) {
	db.transaction(
		function(tx) {
			tx.executeSql("DELETE FROM Song WHERE id = ?", [id], null, null);
		}
	);
}

function loadLatestSong() {
	db.transaction(
		function(tx) {
			tx.executeSql("SELECT id, title, song FROM Song ORDER BY timestamp LIMIT 1", [],
			function(tx, result) {
				if(result.rows.length) {
					displaySong(
						result.rows.item(0)['id'], 
						result.rows.item(0)['title'], 
						result.rows.item(0)['song']
					); 
				}
			}, null);
		}
	);
}

function loadDefaultData() {
	//if we made the schema for the first time add in some default 
	// data for them to play with
	createSong(DEFAULT_SONG_TITLE, "\
Got a good reason, for taking the easy way out: E7 \n\
Got a good reason, for taking the easy way out: A7 E7 \n\
She was a day____ tripper, one way ticket yeah: F# \n\
It took me so____ long to find out, and I found out: A7 G#7 C# B");
}

function removeAll() {
	db.transaction(
		function(tx) {
			tx.executeSql("DROP TABLE Song", [], null, null);
		}
	);
}

function displaySong(id, title, song) {
	$("#songId").val(id);
	$("#songTitle").val(title);
	$("#songArea").val(song);
	refreshDisplay();
}

function addItemToSongList(id, title) {
	$("#songList ul").append(
		'<li><a href="#" onclick="loadSong('+id+')">'+title+'</a></li>'
	);
}

function newSong() {
	var r = Math.floor(Math.random()*58)
	var title = String.fromCharCode( (r+65) ) + new Date().getTime() + "";
	createSong(title, "");
	addItemToSongList(idHash(title), title);
}

function deleteSong(id) {
	if(confirm("Yeah?")) {
		removeSongFromDatabase(id)
	}
}


////////////////////////////////////////////////////////////////////////////////////////////////

/**
 */
$(document).ready(function(){
	opendb();
	createSchema();
	loadLatestSong();
	createSongList();
	
	$("#toggleArea").click(function(){
		$("#songArea").toggle('slow');
	});
	
	$("#newSong").click(function(){
		newSong();
	});
	
	$("#deleteSong").click(function(){
		deleteSong($("#songId").val());
	});
	
	$("#songArea").keyup(function() {
		updateSong(
			$("#songId").val(), 
			$("#songTitle").val(),
			$("#songArea").val()
		);
	});
})