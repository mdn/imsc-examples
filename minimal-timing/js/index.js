var renderDiv = document.querySelector("#render-div");
var textareaContent = document.querySelector(".ttml-content");
var reset = document.getElementById("reset");
var reload = document.getElementById("reload");
var defaultCode = textareaContent.value;
var myVideo = document.getElementById("imscVideo");
var myTrack = myVideo.addTextTrack("subtitles", "IMSC-Demo", "en");

reset.addEventListener("click", function() {
  textareaContent.value = defaultCode;
});

reload.addEventListener("click", function() {
  clearSubFromScreen();
  emptyCuesFromTrack();
  initTrack();
  myVideo.currentTime = 0;
});

initTrack();

function initTrack() {
  var imscDoc = imsc.fromXML(textareaContent.value);
  var timeEvents = imscDoc.getMediaTimeEvents();
  //create cue per timed event and render isd
  for (var i = 0; i < timeEvents.length; i++) {
    //Edge and IE implement "Generic Cue", the other browsers only VTTCue
    var Cue = window.VTTCue || window.TextTrackCue;
    //The duration of the last "timed text event" is the end of the video
    //This may not be know at time of computing therefore we use highest
    //number possible
    if (i < timeEvents.length - 1) {
      var myCue = new Cue(timeEvents[i], timeEvents[i + 1], ""); //We have to provide empty string as VTTText
    } else {
      var myCue = new Cue(timeEvents[i], Number.MAX_VALUE, "");
    }
    myCue.onenter = function() {
      clearSubFromScreen();
      var myIsd = imsc.generateISD(imscDoc, this.startTime);
      imsc.renderHTML(myIsd, renderDiv);
    };
    myCue.onexit = function() {
      clearSubFromScreen();
    };
    myTrack.addCue(myCue);
  }
}

function emptyCuesFromTrack() {
  while (myTrack.cues.length) {
    var cueToRemove = myTrack.cues[0];
    myTrack.removeCue(cueToRemove);
  }
}

function clearSubFromScreen() {
  var subtitleActive = renderDiv.getElementsByTagName("div")[0];
  if (subtitleActive) {
    renderDiv.removeChild(subtitleActive);
  }
}