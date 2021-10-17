import { rails } from './rails.js';

export function railPrefForm(param, index) {
  const options = rails.getRails().map(rail => {
    const selected = param.type === rail.outputName ? "selected" : "";
    return `<option value="${rail.outputName}" ${selected}>${rail.name}</option>`;
  });
  return `<div>
  <label class="form-item-inline">
    <span class="label"> Rail #${index + 1} type:</span>
    <select class="w150" jumon-bind="type">
${options.join("\n      ")}
    </select>
  </label>
  <div>
    <label>
      <input type="checkbox" jumon-bind="flip"> Flip
    </label>
  </div>
</div>
`;
}
