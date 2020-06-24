
// init function for drop down menu 
// load and intial web page load

function init() {
    var drop_down = d3.select("#Dataset");
    d3.json("data/samples.json").then((data) => {

        // loop through data array
        // append each of the values into the drop down menu

        data.names.forEach(function(name) {
            drop_down.append("option").text(name);
        });

        // call function for intial web page load
        buildplot(data.names[0]);
    });
}

// call init function for the inital web page
init();

// buildplot function
function buildplot(id) {
    d3.json("data/samples.json").then((data) => {
        var metadata = data.metadata.filter(row => row.id === parseInt(id));
        metadata_obj = metadata[0]
 
        // filter samples by id 
        var FilterSamples = data.samples.filter(row => row.id === id);

        // getting object to work on
        FilterSamples_obj = FilterSamples[0]

        // separate out otu_ids,sample_values and otu_labels from object as arrays to work on

        var otu_ids = Object.values(FilterSamples_obj.otu_ids)
        var sample_values = Object.values(FilterSamples_obj.sample_values)
        var otu_labels = Object.values(FilterSamples_obj.otu_labels)


        // loop thorugh the arrays of otu_ids,sample_values and otu_labels to make them as an object entry with value and index
        var Samples = otu_ids.map((value, index) => ({
            otu_ids: value,
            sample_values: sample_values[index],
            otu_labels: otu_labels[index]
           
            
        }))


        // sorting samples by sample_values in descending order 
        SortedSamples = Samples.sort((a, b) => b.sample_values - a.sample_values)


        // slice top 10 OTU samples from the sorted array and reverse it for plotly defaults
        SlicedSamples = SortedSamples.slice(0, 10).reverse();


        // horizontal bar Chart for Top 10 OTU samples, create trace
       
        var traceBarChart = {
            x: SlicedSamples.map(object => object.sample_values),
            y: SlicedSamples.map(object => `OTU ${object.otu_ids}`),
            text: SlicedSamples.map(object => object.otu_labels),
            type: "bar",
            orientation: "h"
        };

        var dataBarChart = [traceBarChart];

        // defining layout for bar chart

        var layoutBarChart = {
            title: "Top 10 Bacteria Cultures Found",
            margin: {
                l: 100,
                r: 100,
                t: 100,
                b: 100
            }
        };


        // build bar Chart
        Plotly.newPlot("bar", dataBarChart, layoutBarChart);



        // Bubble chart for each sample, create trace2

        var traceBubbleChart = {
            x: otu_ids,
            y: sample_values,
            mode: "markers",
            marker: {
                size: sample_values,
                color: otu_ids
            },
            text: otu_labels
        };

        var dataBubbleChart = [traceBubbleChart];


        // set layout for bubble plot
        var layoutBubbleChart = {
            title: "Bacteria Cultures Per Sample",
            xaxis: { title: "OTU ID" },
            height: 500,
            width: 1000
        };


        // build bubble chart
        Plotly.newPlot("bubble", dataBubbleChart, layoutBubbleChart);

        // Demographics Information for each Subject
        // select demographic div to append data
        var demographicInfo = d3.select("#sample-metadata");


       // empty information each time before appending
        demographicInfo.html("");

        // loop through metadata object and get the required data to append as a h6 heading text

        Object.entries(metadata_obj).forEach((entry) => {
            demographicInfo.append("h6").text(`${entry[0].toUpperCase()}: ${entry[1]}`);
                        
        });


        // Gauge Chart for wash frequency, get wash frequency from metadata object

        var wfreq = metadata_obj.wfreq
        var degrees = 9 - wfreq,
            radius = .5
        var radians = degrees * Math.PI / 9
        var x = radius * Math.cos(radians)
        var y = radius * Math.sin(radians)
     

        var mainPath = 'M -.0 -0.025 L .0 0.025 L '
        var path = mainPath.concat(`${x}  ${y}  z`)

   
        // create data trace array for gauge chart

        var dataGaugeChart = [{
            type: 'scatter',
            x: [0],
            y: [0],
            marker: {size: 20, color: 'brown'},
            showlegend: false,
            name: "Scrubs/Week",
            text: wfreq
        },

        {
            textinfo: 'text',
            textposition: 'inside',
            hole: .5,
            type: 'pie',
            showlegend: false,
            marker: { colors: ['beige','tan','silver','grey','lightblue','turquoise','teal','aqua','blue','white']},
            values: [ 81/9, 81/9, 81/9, 81/9, 81/9, 81/9, 81/9, 81/9, 81/9, 81],
            rotation: 90,
            text: ['0-1','1-2','2-3','3-4','4-5','5-6','6-7','7-8','8-9'],
            direction: 'clockwise',
            hoverinfo: 'text'
        }]

        // set layout for gauge chart
        var layoutGaugeChart = {
                shapes: [{
                type: 'path',
                path: path,
                fillcolor: 'brown',
                line: {
                    color: 'brown'
                }
            }],
          
            title: '<b>Belly Button Washing Frequency</b> <br> Scrubs per week',
                   
            width: 700,
            height: 500,
            margin: { t: 150, b: 0, l: 0, r: 0 },
            xaxis: { zeroline: false, showticklabels: false, showgrid: false, range: [-1, 1] },
            yaxis: { zeroline: false, showticklabels: false, showgrid: false, range: [-1, 1] }

        };

       // plot gauge chart
        Plotly.newPlot("gauge", dataGaugeChart, layoutGaugeChart);
    })
}

// function for drop down option change, then calling buildplot function for respective sample id

function optionChanged(id) {
    buildplot(id);
}