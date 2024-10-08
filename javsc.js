(function (H) {
    H.seriesTypes.pie.prototype.animate = function (init) {
        const series = this,
            chart = series.chart,
            points = series.points,
            { animation } = series.options,
            { startAngleRad } = series;

        function fanAnimate(point, startAngleRad) {
            const graphic = point.graphic,
                args = point.shapeArgs;

            if (graphic && args) {
                graphic
                    .attr({
                        start: startAngleRad,
                        end: startAngleRad,
                        opacity: 1
                    })
                    .animate({
                        start: args.start,
                        end: args.end
                    }, {
                        duration: animation.duration / points.length
                    }, function () {
                        if (points[point.index + 1]) {
                            fanAnimate(points[point.index + 1], args.end);
                        }
                        if (point.index === series.points.length - 1) {
                            series.dataLabelsGroup.animate({
                                opacity: 1
                            },
                                void 0,
                                function () {
                                    points.forEach(point => {
                                        point.opacity = 1;
                                    });
                                    series.update({
                                        enableMouseTracking: true
                                    }, false);
                                    chart.update({
                                        plotOptions: {
                                            pie: {
                                                innerSize: '40%',
                                                borderRadius: 8
                                            }
                                        }
                                    });
                                });
                        }
                    });
            }
        }

        if (init) {
            points.forEach(point => {
                point.opacity = 0;
            });
        } else {
            fanAnimate(points[0], startAngleRad);
        }
    };
}(Highcharts));

function createChart(data) {
    Highcharts.chart('container', {
        chart: {
            type: 'pie',
            backgroundColor: null, // Set the background color to transparent
            animation: {
                duration: 1000 // Set duration for the pie chart animation
            }
        },
        title: {
            text: 'Emotional Tone Breakdown'
        },
        tooltip: {
            pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>'
        },
        accessibility: {
            point: {
                valueSuffix: '%'
            }
        },
        plotOptions: {
            pie: {
                allowPointSelect: true,
                borderWidth: 2,
                cursor: 'pointer',
                dataLabels: {
                    enabled: true,
                    format: '<b>{point.name}</b><br>{point.percentage}%',
                    distance: 20
                },
                colors: ['#FF5733', '#33FF57', '#3357FF']
            }
        },
        series: [{
            enableMouseTracking: false,
            animation: {
                duration: 2000
            },
            colorByPoint: true,
            data: data
        }]
    });
}

async function analyzeSentiment() {
    const userInput = document.getElementById('userInput').value;
    const resultDiv = document.getElementById('result');
    const sentimentSpan = document.getElementById('sentiment');
    const container2 = document.querySelector('.container2');

    // Hide container2 if there's no input
    container2.classList.remove('visible');
    if (userInput.trim() === "") {
        sentimentSpan.textContent = "Please enter some text.";
    } else {
        try {
            // Send a POST request to your FastAPI with the user's input
            const response = await fetch('http://127.0.0.1:8000/api', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ "input_text": userInput })  // Adjusted key
            });

            if (response.ok) {
                const data = await response.json();
                // Assuming the API returns sentiment analysis data (positive, negative, neutral)

                sentimentSpan.textContent = `${data.sentiment}`;  // Adjust to match FastAPI's response
                const chartData = [
                    { name: 'Negative', y: data.negative *100},
                    { name: 'Positive', y: data.positive*100 },
                    { name: 'Neutral', y: data.neutral*100 }
                ];
                createChart(chartData);
            } else {
                const errorData = await response.json();
                sentimentSpan.textContent = `Error: ${JSON.stringify(errorData, null, 2)}`;
            }
        } catch (error) {
            sentimentSpan.textContent = `Network error: ${error}`;
        }
    }
    resultDiv.style.display = "block";
    // Reveal the container2 with the chart
    container2.classList.add('visible');
}
