import {
  calcByCalcType,
  cleanSimpleFilter,
  convertBasedOnNovelType,
  convertToDateNumsOrNullByTargetType,
  createCustomFilterBy,
  createSimpleFilterBy,
  createValidatorByComType,
  dateToNum,
  getTypeOrNull,
  parse,
  SimpleFilter,
} from '../../main/scripts/SettingsUtil';

test('parse', () => {
  expect(parse(',1, 2,3, . 4,,5,.')).toStrictEqual(['1', '2', '3', '4', '5']);
});

test('getCache', () => {
  // TODO
});

test('convertCacheToString', () => {
  // TODO
});

test('cleanSimpleFilter', () => {
  const obj: SimpleFilter = {
    novelType: 'normal',
    targetType: 'general_firstup',
    calcType: 'avg',
    value: 'hogehoge',
    compType: 'higher',
  };
  const expected = Array(5).fill({}).map(() => ({...obj}));
  const testTarget = expected.map((it) => ({...it, hoge: 0, fuga: '', piyo: {}}));
  expect(testTarget).not.toStrictEqual(expected);
  expect(cleanSimpleFilter(testTarget)).toStrictEqual(expected);
});

test('createCustomFilterBy', async () => {
  const emptyFilter = createCustomFilterBy('');
  expect(await emptyFilter('hoge', 'fuga', 0, [])).toBe(false);
  const invalidFilter = createCustomFilterBy(')invalid(;');
  expect(await invalidFilter('hoge', 'fuga', 0, [])).toBe(false);
  const trueFilter = createCustomFilterBy('return true;');
  expect(await trueFilter('hoge', 'fuga', 0, [])).toBe(true);
  const argCheckFilter =
    createCustomFilterBy('return userId=="hoge" && ncode=="fuga" && allcount==1 && data[0].title=="piyo";');
  expect(await argCheckFilter('hoge', 'fuga', 1, [{title: 'piyo'} as any])).toBe(true);
});

test('createSimpleFilterBy: target: number, value: number', async () => {
  const testData = [
    {ncode: 'ncode', ['novel_type']: 1, ['all_point']: 1},
    {ncode: 'ncode', ['novel_type']: 2, ['all_point']: 3},
    {ncode: 'ncode', ['novel_type']: 2, ['all_point']: 5},
    {ncode: 'ncode', ['novel_type']: 2, ['all_point']: 7},
  ];
  const filterCommon: { novelType: 'short', targetType: 'all_point' } = {
    novelType: 'short',
    targetType: 'all_point',
  };
  expect(await createSimpleFilterBy(
      [{
        ...filterCommon,
        calcType: 'sum', value: '15', compType: 'equal',
      }],
  )('', 'ncode', testData.length, testData as any),
  ).toBe(true);
  expect(await createSimpleFilterBy(
      [{
        ...filterCommon,
        calcType: 'avg', value: '5', compType: 'equal',
      }],
  )('', 'ncode', testData.length, testData as any),
  ).toBe(true);
});

test('createSimpleFilterBy: target: date, value: number', async () => {
  const dateToString = (d: Date) => d.toISOString().slice(0, 10);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);

  const testData = [
    {ncode: 'ncode', ['novel_type']: 1, ['general_firstup']: dateToString(today)},
    {ncode: 'ncode', ['novel_type']: 2, ['general_firstup']: dateToString(yesterday)},
    {ncode: 'ncode', ['novel_type']: 2, ['general_firstup']: dateToString(tomorrow)},
  ];
  const filterCommon: { novelType: 'all', targetType: 'general_firstup' } = {
    novelType: 'all',
    targetType: 'general_firstup',
  };

  expect(await createSimpleFilterBy(
      [{
        ...filterCommon,
        calcType: 'every', value: '2', compType: 'lower',
      }],
  )('', 'ncode', testData.length, testData as any),
  ).toBe(true);
  expect(await createSimpleFilterBy(
      [{
        ...filterCommon,
        calcType: 'every', value: '1', compType: 'lower',
      }],
  )('', 'ncode', testData.length, testData as any),
  ).toBe(false);
});

test('createSimpleFilterBy: target: date, value: date', async () => {
  const testData = [
    {ncode: 'ncode', ['novel_type']: 1, ['novelupdated_at']: '2000/1/1'},
    {ncode: 'ncode', ['novel_type']: 2, ['novelupdated_at']: '2000-1-2 12:30'},
    {ncode: 'ncode', ['novel_type']: 2, ['novelupdated_at']: '1999-12-31'},
  ];
  const filterCommon: { novelType: 'all', targetType: 'novelupdated_at' } = {
    novelType: 'all',
    targetType: 'novelupdated_at',
  };
  expect(await createSimpleFilterBy(
      [{
        ...filterCommon,
        calcType: 'some', value: '2000/1/2 0:05', compType: 'equal',
      }],
  )('', 'ncode', testData.length, testData as any),
  ).toBe(true);
  expect(await createSimpleFilterBy(
      [{
        ...filterCommon,
        calcType: 'every', value: '2000/1/3', compType: 'lower',
      }],
  )('', 'ncode', testData.length, testData as any),
  ).toBe(true);
  expect(await createSimpleFilterBy(
      [{
        ...filterCommon,
        calcType: 'every', value: '1999/12/30', compType: 'higher',
      }],
  )('', 'ncode', testData.length, testData as any),
  ).toBe(true);
});

test('createSimpleFilterBy: error', async () => {
  // TODO
});

test('convertBasedOnNovelType', () => {
  const testData = Array(4).fill(0).map((_, i) => ({ncode: `Code${i}`, ['novel_type']: i % 2 + 1}));
  const target = convertBasedOnNovelType('cOdE2', testData as any);
  expect(target.this).toStrictEqual([{ncode: 'Code2', ['novel_type']: 1}]);
  expect(target.normal).toStrictEqual([{ncode: 'Code0', ['novel_type']: 1}, {ncode: 'Code2', ['novel_type']: 1}]);
  expect(target.short).toStrictEqual([{ncode: 'Code1', ['novel_type']: 2}, {ncode: 'Code3', ['novel_type']: 2}]);
  expect(target.all).toStrictEqual(testData);
});

test('getTypeOrNull', () => {
  expect(getTypeOrNull(123)).toBe('num');
  expect(getTypeOrNull(1.2345)).toBe('num');
  expect(getTypeOrNull('12345')).toBe('num');
  expect(getTypeOrNull('1.2345')).toBe('num');
  expect(getTypeOrNull('2020/01/01')).toBe('date');
  expect(getTypeOrNull('2020-12-31')).toBe('date');
  expect(getTypeOrNull('1F')).toBe(null);
  expect(getTypeOrNull({})).toBe(null);
});

test('dateToNum', () => {
  expect(dateToNum(new Date('1999-09-09'))).toBe(19990909);
  expect(dateToNum(new Date('2000/1/2'))).toBe(20000102);
});

test('convertToDateNumsOrNullByTargetType', () => {
  const testData = ['1990-1-01', '2000/12/31 12:30', '2010 6 1'].map((it) => ({genre: it}));
  const expected = [19900101, 20001231, 20100601];
  expect(convertToDateNumsOrNullByTargetType(testData as any, 'genre')).toStrictEqual(expected);
  expect(convertToDateNumsOrNullByTargetType([...testData, {genre: '20001313'}] as any, 'genre')).toBe(null);
  expect(convertToDateNumsOrNullByTargetType([...testData, {genre: 19000101}] as any, 'genre')).toBe(null);
});

test('createValidatorByComType', () => {
  const equal = createValidatorByComType(123, 'equal');
  expect(equal).not.toBe(null);
  expect(equal!(123)).toBe(true);
  expect(equal!(123.1)).toBe(false);
  const not = createValidatorByComType(234, 'not');
  expect(not).not.toBe(null);
  expect(not!(234)).toBe(false);
  expect(not!(234.1)).toBe(true);
  const higher = createValidatorByComType(345, 'higher');
  expect(higher).not.toBe(null);
  expect(higher!(345)).toBe(false);
  expect(higher!(345.1)).toBe(true);
  const lower = createValidatorByComType(456, 'lower');
  expect(lower).not.toBe(null);
  expect(lower!(456)).toBe(false);
  expect(lower!(455.9)).toBe(true);
});

test('calcByCalcType', () => {
  const equals = (n: number) => ((v: number) => n === v);
  expect(calcByCalcType([1, 2, 3, 4, 5, 6], 'avg', equals(3.5))).toBe(true);
  expect(calcByCalcType([2, 3, 4, 5, 6, 7], 'sum', equals(27))).toBe(true);
  expect(calcByCalcType([4, 5, 6], 'every', equals(5))).toBe(false);
  expect(calcByCalcType([5.6, 5.6, 5.6], 'every', equals(5.6))).toBe(true);
  expect(calcByCalcType([6, 7, 8], 'some', equals(8))).toBe(true);
  expect(calcByCalcType([7, 8, 9], 'some', equals(6))).toBe(false);
});
