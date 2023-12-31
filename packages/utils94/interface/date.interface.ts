export interface Day {
  year: number;
  month: number;
  day: number;
  text: string; // 当前日期 2020/10/10
  week: number; // 0-6
  current: boolean; // 是否当前月
  isToday: boolean; // 是否今天
  source: Date;
  data?: any; // 补足数据
}
export interface DayData {
  [key: string]: any;
}

export interface CreateMonthArguments {
  date?: Date | number | string | undefined; // 初始日期
  data?: DayData; // 补足到对应日期的数据
  weekStart?: number; // 日期开始周，默认为1 从周一开始
  isSliceByWeek?: boolean; // 是否按周切割，默认不切割
}
