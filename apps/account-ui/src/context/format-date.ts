export const FORMAT_DATE_AND_TIME: Intl.DateTimeFormatOptions = {
  dateStyle: "long",
  timeStyle: "short",
};

export default function useFormatDate() {
  return function formatDate(
    date: Date,
    options: Intl.DateTimeFormatOptions | undefined = FORMAT_DATE_AND_TIME
  ) {
    return date.toLocaleString("en", options);
  };
}
