var mousePressed = false;
var lastX, lastY;
var ctx;
var predictbar;
var chart;
var stroke_color='#000000';
var stroke_width=10;
const model_url="../model/model.json";
async function load()
{
    model=await tf.loadLayersModel(model_url);
    chart=create_graph();
}
load();
function InitThis()
{
  ctx = document.getElementById('draw').getContext("2d");
  feed=document.getElementById('feed').getContext("2d");
  predictbar=document.getElementById('prediction');
  chart=document.getElementById('predict-chart').getContext("2d");
  $('#draw').mousedown(function (e) {
      mousePressed = true;
      Draw(e.pageX - $(this).offset().left, e.pageY - $(this).offset().top, false);
  });
  $('#draw').mousemove(function (e) {
      if (mousePressed) {
          Draw(e.pageX - $(this).offset().left, e.pageY - $(this).offset().top, true);
      }
  });
  $('#draw').mouseup(function (e) {
      mousePressed = false;
  });
   $('#draw').mouseleave(function (e) {
      mousePressed = false;
  });
  $('#clear').click(function(){
    clear();
  });
  $('#predict').click(function(){
    predict();
  });
}
function Draw(x, y, isDown)
{
  if (isDown)
  {
      ctx.beginPath();
      ctx.strokeStyle = stroke_color;
      ctx.lineWidth = stroke_width;
      ctx.lineJoin = "round";
      ctx.lineCap="round";
      ctx.moveTo(lastX, lastY);
      ctx.lineTo(x, y);
      ctx.closePath();
      ctx.stroke();
  }
  lastX = x; lastY = y;
}
function clear()
{
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  feed.setTransform(1, 0, 0, 1, 0, 0);
  feed.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  removeDataFromGraph(chart);
  addDataToGraph(chart,[0.1,0.1,0.1,0.1,0.1,0.1,0.1,0.1,0.1,0.1]);
  predictbar.innerHTML="Predicted Digit = NAN".toString();
}
function predict()
{
  feed.drawImage(ctx.canvas,0,0,feed.canvas.width,feed.canvas.height);
  let data=feed.getImageData(0,0,feed.canvas.width,feed.canvas.height).data;
  let inputs=[];
  for(var i=3;i<data.length;i=i+4)
  {
    inputs.push(data[i]/255.0);
  }
  var input_tensor=tf.tensor4d(inputs,[1,28,28,1])
  var prediction=model.predict(input_tensor).dataSync();
  removeDataFromGraph(chart);
  addDataToGraph(chart,prediction);
  var number=indexOfMax(prediction);
  if(validPrediction(prediction))
  {
      predictbar.innerHTML="Predicted Digit = "+number.toString();
  }
  else
  {
      predictbar.innerHTML="Not Sure About it, It may be: "+number.toString();
  }
}
function validPrediction(arr)
{
    return (arr[indexOfMax(arr)]>0.5)
}
function indexOfMax(arr)
{
    if (arr.length === 0)
    {
        return -1;
    }

    var max = arr[0];
    var maxIndex = 0;
    for (var i = 1; i < arr.length; i++)
    {
        if (arr[i] > max)
        {
            maxIndex = i;
            max = arr[i];
        }
    }
    return maxIndex;
}
function create_graph()
{
    var dChart = new Chart(chart, {
        type: 'doughnut',
        data: {
            labels:[0,1,2,3,4,5,6,7,8,9],
            datasets:
            [
                {
                    label:"Prediction",
                    data:[0.1,0.1,0.1,0.1,0.1,0.1,0.1,0.1,0.1,0.1],
                    backgroundColor:
                    [
                        '#774CFF',
                        '#52F537',
                        '#FFE87D',
                        '#EB8B6C',
                        '#F943FF',
                        '#626F80',
                        '#66ABFF',
                        '#C4DFFF',
                        '#335680',
                        '#A5BBD6'
                    ],
                    borderColor:'#fff',
                    borderWidth: 1
                }
            ]
        },
        options:{

            responsive: true,
            maintainAspectRatio: false,
            legend:
            {
                labels:
                {
                    fontColor:'#fff'
                },
                position:'right',
                fullWidth:true
            }
        }
    });
    dChart.canvas.parentNode.style.height = '300px';
    dChart.canvas.parentNode.style.width = '500px';
    return dChart;
}
function addDataToGraph(chart,data)
{
    chart.data.datasets[0].data=data
    chart.update();
}
function removeDataFromGraph(chart)
{
    chart.data.datasets[0].data=[];
    chart.update();
}
