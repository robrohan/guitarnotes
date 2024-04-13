const DEFAULT_SONG_TITLE = "My Great Song";
const COLOURS = {
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

const scale = [
//____1____ ____2____ ____3____ ____4____ ____5____  6   7   8   9  10  11  12
  "C#","Db","D#","Eb","F#","Gb","G#","Ab","A#","Bb","C","D","E","F","G","A","B"
];

    /*  s6   0    1      2     3     4      5 */
const pref = ["E", "F", "F#Gb", "G", "G#Ab", "A",
    /*        6      7    8     9     10    11
    /*  s5    1      2    3     4      5     6  */
	        "A#Bb", "B", "C", "C#Db", "D", "D#Eb"];

function chordColour(chord) {
	//C#dim C7 D D#add9 Ebadd13 B
	//if there is just one note, easy, return major
	if(chord.length == 1){
		return { note: chord, colour: COLOURS.MAJOR };
	} else if (chord.length == 2 && (chord.substring(1) == "#" || chord.substring(1) == "b")){
		return { note: chord, colour: COLOURS.MAJOR };
	}

	//The first character should always be a note
	let baseNote = chord.substring(0,1);
	let modifier = chord.substring(1,2);
	if(modifier == "#" || modifier == "b") {
		baseNote += modifier;
	}
	let colourRequest = chord.substring(baseNote.length);
	
	return { note: baseNote, colour: colourRequest };
}

function chordToClass(note) {
	let arrayPos = null;
	let stringNum = 0;
	let fretNum = 0;

	if(note.length == 0) {
		return null;
	}

	//find the position in the pref array the note 
	//can be found in. From there we can get the
	//string and fret number we prefer
	for(let q=pref.length-1; q>=0; q--) {
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

function createSection(title) {
	const newSection = document.createElement("DIV");
	newSection.setAttribute("class","section");
	const sectionTitle = document.createElement("H2");
	sectionTitle.appendChild(document.createTextNode(title));
	newSection.appendChild(sectionTitle);
	return newSection;
}

function addChord(section, stringAndFret, chordAndColour) {
	let chord = document.createElement("DIV");
	chord.setAttribute("class","chord");

	let note = document.createElement("DIV");
	note.setAttribute("class","note");
	note.appendChild(document.createTextNode(
		chordAndColour.note + "" + 
		( (chordAndColour.colour == COLOURS.MAJOR) ? "" : chordAndColour.colour )
	));

	let wrapper = document.createElement("DIV");

	let fret = document.createElement("DIV");
	fret.setAttribute("class","fret");
    if(chordAndColour.note.indexOf("x") != 0)
		fret.appendChild(document.createTextNode(stringAndFret.fretNum));

	let chordDisplay = document.createElement("DIV");
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
	const mainDisplayDom = document.querySelector("#mainDisplay");
	mainDisplayDom.innerHTML = "";
	const song = document.querySelector("#songArea").value;
	
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
		mainDisplayDom.append(section);

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

////////////////////////////////////////////////////////////////////////////////////////////////

function init() {
	const songAreaDom = document.querySelector("#songArea");

	songAreaDom.addEventListener("keyup", () => {
		refreshDisplay();
	});

	refreshDisplay();
}

