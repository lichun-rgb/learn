import $ from 'jquery';
import BpmnModeler from 'bpmn-js/lib/Modeler';

import propertiesPanelModule from 'bpmn-js-properties-panel';
import propertiesProviderModule from 'bpmn-js-properties-panel/lib/provider/camunda';
import camundaModdleDescriptor from 'camunda-bpmn-moddle/resources/camunda.json';

import {
  debounce
} from 'min-dash';

import diagramXML from '../resources/newDiagram.bpmn';


var container = $('#js-drop-zone');

var canvas = $('#js-canvas');

var bpmnModeler = new BpmnModeler({
  container: canvas,
  propertiesPanel: {
    parent: '#js-properties-panel'
  },
  additionalModules: [
    propertiesPanelModule,
    propertiesProviderModule
  ],
  moddleExtensions: {
    camunda: camundaModdleDescriptor
  }
});


container.removeClass('with-diagram');

function createNewDiagram() {
  openDiagram(diagramXML);
}

function openDiagram(xml) {

  bpmnModeler.importXML(xml, function(err) {

    if (err) {
      container
        .removeClass('with-diagram')
        .addClass('with-error');

      container.find('.error pre').text(err.message);

      // console.error(err);
    } else {
      container
        .removeClass('with-error')
        .addClass('with-diagram');
    }


  });
}

function saveSVG(done) {

  bpmnModeler.saveSVG(done);
}

function saveDiagram(done) {
 
  
  bpmnModeler.saveXML({ format: true }, function(err, xml) {

   
    var str = '';
    var xmlstr1='';
    var xmlStr2='';
    if(xml.indexOf('<flowable:in businessKey="#{execution.processBusinessKey}" />')!=-1){
      str = xml.split('<bpmn2:callActivity');
      for(let j = 0; j < str.length; j++) {
        if(j==str.length-1){
          xmlStr2+=str[j]
        }else{
          xmlStr2+=str[j]+'<bpmn2:callActivity flowable:inheritBusinessKey="true" flowable:inheritVariables="true" ';
        }
      }
    //  str = xmlStr2.split('<flowable:in businessKey="#{execution.processBusinessKey}" />')
    //  for(let j = 0; j < str.length; j++) {
    //   xmlstr1+=str[j]
    // }
      xml=xmlStr2;
    }
    // 将xml文件中的camunda更换为flowable 结束
    console.log("xml:",xml)
    done(err, xml);
  });
}

function registerFileDrop(container, callback) {

  function handleFileSelect(e) {
    e.stopPropagation();
    e.preventDefault();

    var files = e.dataTransfer.files;

    var file = files[0];

    var reader = new FileReader();

    reader.onload = function(e) {

      var xml = e.target.result;

      callback(xml);
    };

    reader.readAsText(file);
  }

  function handleDragOver(e) {
    e.stopPropagation();
    e.preventDefault();

    e.dataTransfer.dropEffect = 'copy'; // Explicitly show this is a copy.
  }

  container.get(0).addEventListener('dragover', handleDragOver, false);
  container.get(0).addEventListener('drop', handleFileSelect, false);
}


////// file drag / drop ///////////////////////

// check file api availability
if (!window.FileList || !window.FileReader) {
  window.alert(
    'Looks like you use an older browser that does not support drag and drop. ' +
    'Try using Chrome, Firefox or the Internet Explorer > 10.');
} else {
  registerFileDrop(container, openDiagram);
}

// bootstrap diagram functions

$(function() {
  $.getUrlParam = function (name) {
    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
    var r = window.location.search.substr(1).match(reg);
    if (r != null) return unescape(r[2]); return null;
}

var bpnmIdstr = $.getUrlParam('haha');

if(bpnmIdstr !=null && bpnmIdstr.toString().length>1)
{
  $.ajax({
    url: "http://127.0.0.1:8081/findModel/"+bpnmIdstr,
    contentType: 'application/json',
    type: "Get",
    dataType: "json",
    success: function(data) {
        var bpmnXml=data.data.bpmnXml
        openDiagram(bpmnXml);
    },
    error: function(data) {
      alert('shibai')
  },
});
}

// 点击取消按钮 将弹窗关闭
var abc="";
var xmlImage='';
$('#btn').click(function(){
  var a=$("#modelName").val();
  if(typeof a == "undefined" || a == null || a == ""){
    alert('请填写流程名称')
      return
  }
  var data = {};
  data.name=a;
  data.bpmnXml=abc;
  data.bpmnImage=xmlImage;
 
  $.ajax({
    url: "http://127.0.0.1:8081/saveModel",
    contentType: 'application/json',
    data: JSON.stringify(data),
    // data: data,
    type: "POST",
    // dataType: "json",
    success: function(data) {
     
    },
});
  })

  createNewDiagram();
  // $('#js-create-diagram').click(function(e) {
  //   e.stopPropagation();
  //   e.preventDefault();

   
  // });

  var downloadLink = $('#js-download-diagram');
  var downloadSvgLink = $('#js-download-svg');

  $('.buttons a').click(function(e) {
    if (!$(this).is('.active')) {
      e.preventDefault();
      e.stopPropagation();
    }
  });

  function setEncoded(link, name, data) {
    var encodedData = encodeURIComponent(data);

    if (data) {
      link.addClass('active').attr({
        'href': 'data:application/bpmn20-xml;charset=UTF-8,' + encodedData,
        'download': name
      });
    } else {
      link.removeClass('active');
    }
  }

  var exportArtifacts = debounce(function() {

    saveSVG(function(err, svg) {
      xmlImage=svg;
      
      setEncoded(downloadSvgLink, 'diagram.svg', err ? null : svg);
    });

    saveDiagram(function(err, xml) {
     abc=xml;
      setEncoded(downloadLink, 'diagram.bpmn', err ? null : xml);
    });
  }, 500);

  bpmnModeler.on('commandStack.changed', exportArtifacts);
});
