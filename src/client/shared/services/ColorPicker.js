import { Service, serviceManager, SegmentedView, client } from 'soundworks/client';
import please from 'pleasejs';


const SERVICE_ID = 'service:color-picker';

const template = `
  <div class="section-top flex-middle">
    <p class="small">Choose your color</p>
  </div>
  <div class="section-center flex-center">
    <div class="color-wrapper">
      <% for (let i = 0; i < 11; i++) { %>
      <div class="circle color"></div>
      <% } %>
      <div class="circle color-change"></div>
    </div>
  </div>
  <div class="section-bottom"></div>
`;

class ColorPickerView extends SegmentedView {
  constructor(...args) {
    super(...args);

    this._updatePalette = this._updatePalette.bind(this);
    this.installEvents({ 'click .color-change': (e) => {
      e.target.classList.add('active');
      this._updatePalette();
    }});
  }

  onRender() {
    super.onRender();

    this.$colorWrapper = this.$el.querySelector('.color-wrapper');
    this.$circles = Array.from(this.$el.querySelectorAll('.circle'));
    this._updatePalette();
  }

  onResize(width, height, orientation) {
    super.onResize(width, height, orientation);

    let size;

    if (orientation === 'portrait') {
      const nbrX = 3;
      const nbrY = 4;

      const bcr = this.$colorWrapper.getBoundingClientRect();
      const width = bcr.width;
      const height = bcr.height;

      size = Math.min(width / nbrX, height / nbrY);
    }

    this.$circles.forEach(($circle) => {
      $circle.style.width = `${size}px`;
      $circle.style.height = `${size}px`;
    });
  }

  _updatePalette() {
    const $circles = this.$circles;
    const colors = please.make_color({
      colors_returned: 11,
      format: 'rgb-string',
      saturation: .75,
      value: .75,
    });

    for (let i = 0; i < 11; i++) {
      const $circle = $circles[i];
      const color = colors[i];

      $circle.style.backgroundColor = color;
      $circle.setAttribute('data-rgb', color);
    }
  }
}

class ColorPicker extends Service {
  constructor() {
    super(SERVICE_ID);

    this._onSelectColor = this._onSelectColor.bind(this);
  }

  init() {
    this.viewTemplate = template;
    this.viewCtor = ColorPickerView;
    this.viewContent = {};
    this.viewOptions = {
      priority: 7,
      ratios: {
        '.section-top': 0.12,
        '.section-center': 0.85,
        '.section-bottom': 0.03,
      }
    };
    this.viewEvents = {
      'touchstart .color': this._onSelectColor,
      'mousedown .color': this._onSelectColor,
    };

    this.view = this.createView();
  }

  start() {
    super.start();

    if (!this.hasStarted)
      this.init();

    this.show();
  }

  stop() {
    this.hide();
  }

  _onSelectColor(e) {
    e.preventDefault();
    e.stopPropagation();

    client.color = e.target.getAttribute('data-rgb');
    this.ready();
  }
}

serviceManager.register(SERVICE_ID, ColorPicker);

export default ColorPicker;
