var mousePressed = false;
var lastX, lastY;
var ctx;
var predictbar;
var stroke_color='#000000';
var stroke_width=10;
const model_url="https://github.com/tarun-bisht/DigitRecognition/blob/master/model/model.json";
var model=tf.loadModel(model_url);
function InitThis()
{
  ctx = document.getElementById('draw').getContext("2d");
  feed=document.getElementById('feed').getContext("2d");
predict=document.getElementById('predict');
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
  var prediction=model.predict(inputs);
predict.innerHTML=prediction
  Console.log(prediction);
}
