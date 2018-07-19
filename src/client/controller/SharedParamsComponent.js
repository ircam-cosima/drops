import * as controllers from '@ircam/basic-controllers';
import { View } from 'soundworks/client';

controllers.setTheme('dark');

/* --------------------------------------------------------- */
/* GUIs
/* --------------------------------------------------------- */

/** @private */
class _BooleanGui {
  constructor($container, param, guiOptions) {
    const { label, value } = param;

    this.controller = new controllers.Toggle({
      label: label,
      default: value,
      container: $container,
      callback: (value) => {
        if (guiOptions.confirm) {
          const msg = `Are you sure you want to propagate "${param.name}:${value}"`;
          if (!window.confirm(msg)) { return; }
        }

        param.update(value);
      }
    });
  }

  set(val) {
    this.controller.value = val;
  }
}

/** @private */
class _EnumGui {
  constructor($container, param, guiOptions) {
    const { label, options, value } = param;

    const ctor = guiOptions.type === 'buttons' ?
      controllers.SelectButtons : controllers.SelectList

    this.controller = new ctor({
      label: label,
      options: options,
      default: value,
      container: $container,
      callback: (value) => {
        if (guiOptions.confirm) {
          const msg = `Are you sure you want to propagate "${param.name}:${value}"`;
          if (!window.confirm(msg)) { return; }
        }

        param.update(value);
      }
    });
  }

  set(val) {
    this.controller.value = val;
  }
}

/** @private */
class _NumberGui {
  constructor($container, param, guiOptions) {
    const { label, min, max, step, value } = param;

    if (guiOptions.type === 'slider') {
      this.controller = new controllers.Slider({
        label: label,
        min: min,
        max: max,
        step: step,
        default: value,
        unit: guiOptions.param ? guiOptions.param : '',
        size: guiOptions.size,
        container: $container,
      });
    } else {
      this.controller = new controllers.NumberBox({
        label: label,
        min: min,
        max: max,
        step: step,
        default: value,
        container: $container,
      });
    }

    this.controller.addListener((value) => {
      if (guiOptions.confirm) {
        const msg = `Are you sure you want to propagate "${param.name}:${value}"`;
        if (!window.confirm(msg)) { return; }
      }

      param.update(value);
    });
  }

  set(val) {
    this.controller.value = val;
  }
}

/** @private */
class _TextGui {
  constructor($container, param, guiOptions) {
    const { label, value } = param;

    this.controller = new controllers.Text({
      label: label,
      default: value,
      readonly: guiOptions.readonly,
      container: $container,
    });

    if (!guiOptions.readonly) {
      this.controller.addListener((value) => {
        if (guiOptions.confirm) {
          const msg = `Are you sure you want to propagate "${param.name}"`;
          if (!window.confirm(msg)) { return; }
        }

        param.update(value);
      });
    }
  }

  set(val) {
    this.controller.value = val;
  }
}

/** @private */
class _TriggerGui {
  constructor($container, param, guiOptions) {
    const { label } = param;

    this.controller = new controllers.TriggerButtons({
      options: [label],
      container: $container,
      callback: () => {
        if (guiOptions.confirm) {
          const msg = `Are you sure you want to propagate "${param.name}"`;
          if (!window.confirm(msg)) { return; }
        }

        param.update();
      }
    });
  }

  set(val) { /* nothing to set here */ }
}


class SharedParamsComponent {
  constructor(experience) {
    this._guiOptions = {};

    this.experience = experience;
    this.sharedParams = experience.sharedParams;
  }

  enter() {
    const $container = this.experience.view.$el.querySelector('#shared-params');

    this.view = new View();
    this.view.render();
    this.view.appendTo($container);

    for (let name in this.sharedParams.params) {
      const param = this.sharedParams.params[name];
      const gui = this._createGui(param);

      param.addListener('update', (val) => gui.set(val));
    }
  }

  exit() {
    for (let name in this.sharedParams.params) {
      const param = this.sharedParams.params[name];
      param.removeListener('update');
    }

    this.view.remove();
  }

  setGuiOptions(name, options) {
    this._guiOptions[name] = options;
  }

  _createGui(param) {
    const config = Object.assign({
      show: true,
      confirm: false,
    }, this._guiOptions[param.name]);

    if (config.show === false) return null;

    let gui = null;
    const $container = this.view.$el;

    switch (param.type) {
      case 'boolean':
        gui = new _BooleanGui($container, param, config); // `Toggle`
        break;
      case 'enum':
        gui = new _EnumGui($container, param, config); // `SelectList` or `SelectButtons`
        break;
      case 'number':
        gui = new _NumberGui($container, param, config); // `NumberBox` or `Slider`
        break;
      case 'text':
        gui = new _TextGui($container, param, config); // `Text`
        break;
      case 'trigger':
        gui = new _TriggerGui($container, param, config);
        break;
    }

    return gui;
  }
}

export default SharedParamsComponent;
