defineAnimeTimelineHelper("timelineBasics",((e,t)=>{const a=anime.timeline({easing:"easeOutExpo",duration:t.duration?+t.duration:750});return a.add({targets:e.querySelectorAll(".el.square"),opacity:[0,1],translateX:250}).add({targets:e.querySelectorAll(".el.circle"),translateX:250}).add({targets:e.querySelectorAll(".el.triangle"),translateX:250}),a})),defineAnimeTimelineHelper("TLParamsInheritance",((e,t)=>{const a=anime.timeline({targets:e.querySelectorAll(".el"),delay:function(e,t){return 200*t},duration:500,easing:"easeOutExpo",direction:"alternate",loop:!0});return a.add({translateX:250,easing:"spring"}).add({opacity:.5,scale:2}).add({targets:e.querySelectorAll(".el.triangle"),rotate:180}).add({translateX:0,scale:1}),a}));