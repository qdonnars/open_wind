import { formatHour, formatDayHeader, groupHoursByDay } from "../utils/format";

interface TimelineHeaderProps {
  times: string[];
}

export function TimelineHeader({ times }: TimelineHeaderProps) {
  const days = groupHoursByDay(times);

  return (
    <>
      <tr>
        <th className="sticky left-0 z-10 bg-gray-900 min-w-[36px]" />
        {Array.from(days.entries()).map(([dateKey, indices]) => (
          <th
            key={dateKey}
            colSpan={indices.length}
            className="bg-gray-900 text-gray-300 text-[8px] font-medium py-px border-b border-gray-700 border-l border-l-gray-700"
          >
            {formatDayHeader(times[indices[0]])}
          </th>
        ))}
      </tr>
      <tr>
        <th className="sticky left-0 z-10 bg-gray-900 min-w-[36px]" />
        {times.map((t, i) => (
          <th
            key={i}
            className="bg-gray-900 text-gray-500 text-[7px] font-normal py-px border-b border-gray-800"
          >
            {formatHour(t)}
          </th>
        ))}
      </tr>
    </>
  );
}
