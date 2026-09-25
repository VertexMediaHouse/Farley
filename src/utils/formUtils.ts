import type { AreaValues, Condition } from '../price-estimator/questions/form';

export function evalCondition(cond: Condition, values: AreaValues): boolean {
  const raw = values[cond.field];
  const val = typeof raw === 'string' ? raw : '';
  let result = true;
  if (cond.is !== undefined) result = val === cond.is;
  else if (cond.not !== undefined) result = val !== cond.not;
  else if (cond.notNo) result = val !== 'No' && val !== '';
  else if (cond.in) result = cond.in.includes(val);
  else if (cond.notIn) result = val !== '' && !cond.notIn.includes(val);
  // Evaluate chained AND condition
  if (result && cond.and) {
    result = evalCondition(cond.and, values);
  }
  return result;
}
