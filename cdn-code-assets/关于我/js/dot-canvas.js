var dotCanvas=document.querySelector('.dot-canvas'),dotCtx=dotCanvas.getContext('2d');
        var dotW,dotH,dotSpacing=12,dotSize=4;
        function resizeDots(){dotW=dotCanvas.width=window.innerWidth;dotH=dotCanvas.height=window.innerHeight}
        resizeDots();window.addEventListener('resize',resizeDots);
        var waveTime=0;
        function animateDots(){
            if(document.documentElement.classList.contains('is-page-leaving')){
                requestAnimationFrame(animateDots);
                return;
            }
            waveTime+=0.016;
            dotCtx.clearRect(0,0,dotW,dotH);
            var cols=Math.ceil(dotW/dotSpacing),rows=Math.ceil(dotH/dotSpacing);
            for(var r=0;r<rows;r++)for(var c=0;c<cols;c++){
                var px=c*dotSpacing,py=r*dotSpacing;
                var wave=Math.sin(px*0.004+py*0.006+waveTime*0.8)*0.5+0.5;
                var alpha=0.08+wave*0.18;
                var size=dotSize+(1-wave)*4;
                dotCtx.fillStyle='rgba(255,255,255,'+alpha.toFixed(3)+')';
                dotCtx.fillRect(c*dotSpacing,r*dotSpacing,size,size);
            }
            requestAnimationFrame(animateDots);
        }
        animateDots();