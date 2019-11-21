import $ from 'jquery';
import BpmnModeler from 'bpmn-js/lib/Modeler';

import propertiesPanelModule from 'bpmn-js-properties-panel';
import propertiesProviderModule from 'bpmn-js-properties-panel/lib/provider/camunda';
import camundaModdleDescriptor from 'camunda-bpmn-moddle/resources/camunda.json';

import {
  debounce
} from 'min-dash';

import diagramXML from '../resources/newDiagram.bpmn';

