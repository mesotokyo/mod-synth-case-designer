import { rails } from './rails.js';

export function railPrefForm(param, index) {
  const options = rails.getRails().map(rail => {
    return `<option value="${rail.outputName}">${rail.name}</option>`;
  });
  return `<div>
  <label class="form-item-inline">
    <span class="label"> rail #${index + 1} type:</span>
    <select class="w150" jumon-bind="type">
${options.join("\n      ")}
    </select>
  </label>
  <div>
    <label>
      <input type="checkbox" jumon-bind="flip"> flip
    </label>
  </div>
</div>
`;
}
