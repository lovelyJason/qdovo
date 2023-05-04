---
layout: tag
sidebar: []
title: 所有标签
import:
  body_end: 
    - <script src="/js/jquery.tagcanvas.min.js"></script>
    - >-
      <script>
        $(document).ready(function() {
          if(!$('#myCanvas').tagcanvas({
            textColour: '#ff0000',
            outlineColour: '#ff00ff',
            reverse: true,
            depth: 0.8,
            maxSpeed: 0.05
          },'tags')) {
            // something went wrong, hide the canvas container
            $('#myCanvasContainer').hide();
          }
        });
      </script>
---

<!-- 注：tagcloud函数传入的tags不能是自定义的简单数组，里面没有sort方法会报错 -->
