let mousePressed = false;
let lastX, lastY;
let ctx;
let predictbar;
let chart;
let graph;
const stroke_width=10;
let stroke_color;
if((theme === null && prefersDarkScheme.matches) || theme === "dark")
{
    stroke_color='#fff';
}
else
{
    stroke_color='#111';
}
document.getElementById("clear").disabled=true;
document.getElementById("predict").disabled=true;
const model_url="https://models-lib.web.app/models/mnist_digits/model.json";
dark_mode_switch();
animate_containers();
(async function(){
	model=await tf.loadLayersModel(model_url);
    document.getElementById("loader-wrapper").style="transition: all .3s ease 0s;display:none;";
})().then(()=>{
    document.getElementById("clear").disabled=false;
    document.getElementById("predict").disabled=false;
});
window.onload=function()
{
    nav_menu();
    filter_projects();
    LazyLoad();
    Init();
}
function Init()
{
    ctx = document.getElementById('draw').getContext("2d");
    feed=document.getElementById('feed').getContext("2d");
    predictbar=document.getElementById('prediction');
    chart=document.getElementById('predict-chart').getContext("2d");
    graph=create_graph();
    let draw=document.getElementById("draw");
    draw.addEventListener("mousedown", (e)=>{
        mousePressed = true;
        Draw(e.pageX - e.target.offsetLeft, e.pageY - e.target.offsetTop, false);
    });
    draw.addEventListener("mousemove", (e)=>{
        if (mousePressed) {
            Draw(e.pageX - e.target.offsetLeft, e.pageY - e.target.offsetTop, true);
        }
    });
    draw.addEventListener("mouseup", (e)=>{
        mousePressed = false;
    });
    draw.addEventListener("mouseleave", (e)=>{
        mousePressed = false;
    });
    document.getElementById("clear").addEventListener("click", (e)=>{
        clear();
    });
    document.getElementById("predict").addEventListener("click", (e)=>{
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
  removeDataFromGraph(graph);
  addDataToGraph(graph,[]);
  predictbar.innerHTML="Predicted Digit = NaN".toString();
}
async function predict()
{
  feed.drawImage(ctx.canvas,0,0,feed.canvas.width,feed.canvas.height);
  let data=feed.getImageData(0,0,feed.canvas.width,feed.canvas.height).data;
  let inputs=[];
  for(let i=3;i<data.length;i=i+4)
  {
    inputs.push(data[i]/255.0);
  }
  let input_tensor=tf.tensor4d(inputs,[1,28,28,1])
  let prediction=await model.predict(input_tensor).data();
  removeDataFromGraph(graph);
  addDataToGraph(graph,prediction);
  let number=indexOfMax(prediction);
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

    let max = arr[0];
    let maxIndex = 0;
    for (let i = 1; i < arr.length; i++)
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
    let dChart = new Chart(chart, {
        type: 'horizontalBar',
        data: {
            labels:[0,1,2,3,4,5,6,7,8,9],
            datasets:
            [
                {
                    data:[],
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
                }
            ]
        },
        options:{
            responsive: true,
            maintainAspectRatio: true,
            tooltips: {
                enabled: true
            },
            legend: {
                display: false,
                position: 'bottom',
                fullWidth: true,
                labels: {
                  boxWidth: 10,
                  padding: 50
                }
            },

            scales: {
                yAxes: [{
                    gridLines: {
                        display: false,
                        drawTicks: true,
                        drawOnChartArea: false
                    },
                    ticks: {
                        fontColor: stroke_color,
                        fontFamily: 'Lato',
                        fontSize: 11
                    },
                }],
                xAxes: [{
                    gridLines: {
                    display: false,
                    drawTicks: true,
                    tickMarkLength: 5,
                    drawBorder: false
                    },
                    ticks: {
                        padding: 5,
                        beginAtZero: true,
                        fontColor: stroke_color,
                        fontFamily: 'Lato',
                        fontSize: 11,
                        callback: function(label, index, labels) {
                        return label*100;
                    },
                },
                }]
            }
        }
    });
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
