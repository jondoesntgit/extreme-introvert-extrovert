$(function(){

var allowExtrovertExtrovertInteractions = true;
var numExtroverts = 0;
var numIntroverts = 0;

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

populateNodes = function(extroverts, introverts) {
    numExtroverts = extroverts;
    numIntroverts = introverts;
    elements = [];
    for (i = 0; i < extroverts; i++) {
        elements.push(createNode("extrovert" + i, "extrovert", i, i));
    }
    for (i = 0; i < introverts; i++) {
        elements.push(createNode("introvert" + i, "introvert", i, i));
    }
    return elements;
}

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
        populateNodes(11,9)
        /*
    createNode("extrovert1", "extrovert", 30,60),
    createNode("extrovert2", "extrovert", 60,30),
    createNode("extrovert3", "extrovert", 60,-30),
    createNode("extrovert4", "extrovert", 30,-60),
    createNode("extrovert5", "extrovert", 100,100),
    //createNode("introvert1", "introvert", -30,-60),
    createNode("introvert2", "introvert", -60,-30),
    createNode("introvert3", "introvert", -60,30),
    createNode("introvert4", "introvert", -30,60),
    */
  
});


var timeSteps = 0;
var removeQueue = [];
var addQueue = [];
timeStep = function() {
    timeSteps++;
    var source, target;
    var collection = cy.collection('node');
    collection.forEach(function(a){
        if (a.hasClass('extrovert')){
            source = a.data('id');
            var complement = a.neighborhood().union(a).complement().intersection('node');
            if (allowExtrovertExtrovertInteractions) {
                complement = complement.intersection('.introvert');
            }
            if (complement.length) {
                var randomIndex = Math.floor(Math.random() * complement.length)
                target = complement[randomIndex].data('id');
                addQueue.push({"source":source, "target":target});
            }
        } else {
            source = a.data('id');
            var neighborhood = a.neighborhood().intersection('node');
            if (neighborhood.length) {
                var randomIndex = Math.floor(Math.random() * neighborhood.length)
                target = neighborhood[randomIndex].data('id');
                removeQueue.push({"source":source, "target":target});
            }
        }
    });
    addQueue.forEach(function(edge){
        cy.add(createEdge("edge" + edge.source +  timeSteps, edge.source, edge.target));
    });
    addQueue = [];
    removeQueue.forEach(function(edge){
        cy.remove('edge[source = "' + edge.source + '"][target = "' + edge.target + '"]');
        cy.remove('edge[source = "' + edge.target + '"][target = "' + edge.source + '"]');
    });
    removeQueue = [];
    interactions = cy.collection('edge').length;
    possible = numExtroverts * numIntroverts;
    percentage = Math.round(interactions / possible * 10000)/100;
    $("#interactions").text(interactions);
    $("#possible").text(possible);
    $("#percentage").text(percentage);
}

setInterval(timeStep , 1000);

});

