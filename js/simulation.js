$(function(){

var allowExtrovertExtrovertInteractions, numExtroverts, numIntroverts;
var timeSteps = 0; // Keep track of how long we have been running
var removeQueue = []; // A queue of edges to remove at the end of timestep
var addQueue = []; // A queue of edges to add at the end of timestep

// Creator function
createNode = function(id, sociableClass, xpos, ypos) {
    json = {"data":{
        "id":id,
         "position":{"x":xpos, "y":ypos},
         "group":"nodes",
         "selectable":true,
         "grabbable":true,
    },
         "classes":sociableClass
    }
    return json;
}

// Creator function
createEdge = function(id, source, target) {
    json = {"data":{
                "id":id,
                "source":source,
                "target":target,
                "group":"edges",
                "selectable":true,
                "grabbable":true,
            },
            "classes":""
    };

    return json;
}

// Make a bunch of extroverts and introverts
populateNodes = function(extroverts, introverts) {
    elements = [];
    for (i = 0; i < extroverts; i++) {
        elements.push(createNode("extrovert" + i, "extrovert", i, i));
    }
    for (i = 0; i < introverts; i++) {
        elements.push(createNode("introvert" + i, "introvert", i, i));
    }
    return elements;
}

// Set up the graph when user presses 'initialize'
initialize = function() {
  numIntroverts = $("#introverts").val()
  numExtroverts = $("#extroverts").val()
  $("#explain").css({"display":"none"});
  $("#stats").css({"display":"block"});
  allowExtrovertExtrovertInteractions = ($("#extro-extro").prop('checked') === true)

  // Some stock code from an cytoscape example
  var cy = window.cy = cytoscape({
    container: document.getElementById('cy'),
  
    boxSelectionEnabled: false,
    autounselectify: true,
    
    layout: {
      name: 'cose-bilkent'
    },
  
    style: [
      {
        selector: 'node.introvert',
        style: {
          'background-color': '#dd3333'
        }
      },
      {
        selector: 'node.extrovert',
        style: {
          'background-color': '#3388ff'
        }
      },
  
      {
        selector: 'edge',
        style: {
          'width': 3,
          'line-color': '#000000'
        }
      }
    ],
  
      elements: 
          populateNodes(numExtroverts, numIntroverts)
});
}

// Update the graph every 1000 milliseconds
setInterval(function() {
  if (cy.collection){
    timeStep()
  }
}, 1000);

// Takes an edge and determines if it already exists.
// This prevents two extroverts from connecting simultaneously
edgeDoesntExist = function(edge) {
    var dir1 = cy.collection('edge[source = "' + edge.source + '"][target = "' + edge.target + '"]');
    var dir2 = cy.collection('edge[source = "' + edge.target + '"][target = "' + edge.source + '"]');
    truthValue = (!(dir1.length > 0 || dir2.length > 0));
    return (truthValue);
}

// What to do every time step
timeStep = function() {
  timeSteps++;
  var source, target;
  var collection = cy.collection('node');

  collection.forEach(function(a){
    if (a.hasClass('extrovert')){
      // If this node is an extrovert
      
      source = a.data('id');
      var complement = a.neighborhood().union(a).complement().intersection('node');
      if (!allowExtrovertExtrovertInteractions) {
          // If we can't interact with other extroverts, only look at introverts
          complement = complement.intersection('.introvert');
      }
      if (complement.length) {
        var randomIndex = Math.floor(Math.random() * complement.length)
        target = complement[randomIndex].data('id');
        addQueue.push({"source":source, "target":target});
      }

    } else {
      // If this node is an introvert
      
      source = a.data('id');
      var neighborhood = a.neighborhood().intersection('node');
      if (neighborhood.length) {
        var randomIndex = Math.floor(Math.random() * neighborhood.length)
        target = neighborhood[randomIndex].data('id');
        removeQueue.push({"source":source, "target":target});
      }
    }
  });

  // Create the new links;
  addQueue.forEach(function(edge){
    if (edgeDoesntExist(edge)) {
      cy.add(createEdge("edge" + Math.random() +  timeSteps, edge.source, edge.target));
    }
  });
  // Clear for next iteration
  addQueue = [];
  // Destroy some links
  removeQueue.forEach(function(edge){
    cy.remove('edge[source = "' + edge.source + '"][target = "' + edge.target + '"]');
    cy.remove('edge[source = "' + edge.target + '"][target = "' + edge.source + '"]');
  });
  // Clear for next iteration
  removeQueue = [];

  // Show some stats
  interactions = cy.collection('edge').length;
  possible = numExtroverts * numIntroverts;

  // Account for extro-extro interactions
  if (allowExtrovertExtrovertInteractions) {
      possible += numExtroverts * (numExtroverts - 1)/2;
  }

  // Write stats to main screen
  percentage = Math.round(interactions / possible * 10000)/100;
  $("#interactions").text(interactions);
  $("#possible").text(possible);
  $("#percentage").text(percentage);

});
