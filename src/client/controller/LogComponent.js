import { View } from 'soundworks/client';

const template = `
  <% logs.forEach(function(log) { %>
    <pre class="error"><%= log %></pre>
  <% }); %>
`;

class LogComponent {
  constructor(experience) {
    this.experience = experience;

    this.stackSize = 20;
    this.stack = [];
  }

  enter() {
    const $container = this.experience.view.$el.querySelector('#log');

    this.view = new View(template, { logs: this.stack });
    this.view.render();
    this.view.appendTo($container);
  }

  exit() {
    this.view.remove();
  }

  error(file, line, col, msg, userAgent) {
    // @todo - check ousrcemap support
    // https://stackoverflow.com/questions/24637356/javascript-debug-stack-trace-with-source-maps
    const logView = `
${userAgent}
${file}:${line}:${col}  ${msg}
    `;
    this.stack.unshift(logView);

    this.view.render();
  }
}

export default LogComponent;
