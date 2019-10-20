function preload(){
    //Loads the roboto font from goole fonts.
    font = loadFont("https://rawgit.com/google/fonts/7a4070f65f2ca85ffdf2d465ff5e095005bae197/apache/roboto/Roboto-Regular.ttf");
}

function setup(){
    var canvas = createCanvas(window.innerWidth, window.innerHeight);
    background(51);
    //frameRate(27); //Lowers frame rate to reduce tick rate
    var initialWord = GetPointsArray("Particle_Word_System", 2); //Creates an initial word to disply
    p = new Particle_System(initialWord.length); //Creates particle population
    for (var target in initialWord) { //Sets target to inital word
        p.particles[target].SetTarget(initialWord[target].x, initialWord[target].y); //Sets each particle target
        p.particles[target].mouseRepelRad = 50; //Turns on mouse repelling
    }
}

function draw(){
    background(51); //Black background
    p.Update(); //Update particle system
    p.Show(); //SHow particle system
}

function GetPointsArray(str, size){ //Returns an array containing points outlining centred text with intpuuted size
    var fontSize = (width/(str.length))*size; //Calculates font size based on string length and size multiplier
    var box = font.textBounds(str, 0, 0, fontSize); //Gets bounding box for font - Used to centre points
    return font.textToPoints(str, (width - box.w)/2, (height + box.h)/2, fontSize,{
    sampleFactor: 0.3, //Ratio of path length to number of samples
    simplifyThreshold: 0 //NGL see referance for what this does
  });
}
