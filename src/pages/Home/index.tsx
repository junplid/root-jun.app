import { JSX } from "react";
import LineChart from "../../components/Charts/Line";
import { BsCalendarWeek } from "react-icons/bs";

export const HomePage: React.FC = (): JSX.Element => {
  return (
    <div className="min-h-screen bg-gray-100 p-8 flex flex-col gap-3">
      <h2 className="text-gray-600">Bem-vindo, Rian!</h2>

      <div className="pointer-events-none select-none grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-2.5">
        <div className="flex flex-col justify-between bg-[#ffffff] overflow-hidden rounded-xl shadow-lg shadow-black/10">
          <div className="flex w-full items-center justify-between p-3 pt-2 pb-0 gap-2">
            <h1 className="text-xs text-black/70 font-medium">Usuários</h1>
            <div className="flex items-center">
              <span className="font-semibold text-xl">13</span>
              <span className="text-[#66bc3e] text-sm">+90%</span>
            </div>
          </div>
          <div className="flex items-center -mt-0.5 mx-3 gap-1 text-gray-500">
            <BsCalendarWeek />
            <button className="flex bg-gray-100 border p-0.5 rounded-sm">
              <span className="text-[11px]">20/01 - 27/01</span>
            </button>
          </div>
          <div
            style={{
              width: "calc(100% + 10px)",
              transform: "translateX(-3px)",
            }}
          >
            <LineChart
              data={{
                labels: [
                  "07/05/2023",
                  "08/05/2023",
                  "09/05/2023",
                  "10/05/2023",
                  "11/05/2023",
                  "12/05/2023",
                  "12/05/2023",
                ],
                datasets: [
                  {
                    label: "",
                    data: [1, 0, 1, 2, 4, 7, 1],
                    borderColor: "#474747",
                    borderWidth: 2,
                    fill: true,
                    tension: 0.3,
                    backgroundColor: (context) => {
                      const chart = context.chart;
                      const { ctx, chartArea } = chart;
                      if (!chartArea) return;
                      const gradient = ctx.createLinearGradient(
                        0,
                        chartArea.bottom,
                        0,
                        chartArea.top,
                      );
                      gradient.addColorStop(1, "#000");
                      gradient.addColorStop(0, "rgba(255, 255, 255, 0)");

                      return gradient;
                    },
                    pointRadius: 5,
                  },
                ],
              }}
              options={{
                layout: { padding: 0 },
                plugins: {
                  legend: { display: false },
                  title: { display: false },
                  tooltip: {},
                },
                scales: {
                  y: {
                    display: false,
                    beginAtZero: false,
                    grace: 0,
                    ticks: { display: false },
                    grid: { display: false },
                  },
                  x: {
                    grid: { display: false },
                    ticks: { display: false, color: "#ddd" },
                    display: false,
                  },
                },
              }}
            />
          </div>
        </div>
        <div className="flex flex-col justify-between bg-[#ffffff] overflow-hidden rounded-xl shadow-lg shadow-black/10">
          <div className="flex w-full items-center justify-between p-3 pt-2 pb-0 gap-2">
            <h1 className="text-xs text-black/70 font-medium">Conexões WA</h1>
            <div className="flex items-center">
              <span className="font-semibold text-xl">21</span>
              <span className="text-[#66bc3e] text-sm">+90%</span>
            </div>
          </div>
          <div className="flex items-center -mt-0.5 mx-3 gap-1 text-gray-500">
            <BsCalendarWeek />
            <button className="flex bg-gray-100 border p-0.5 rounded-sm">
              <span className="text-[11px]">20/01 - 27/01</span>
            </button>
          </div>
          <div
            style={{
              width: "calc(100% + 10px)",
              transform: "translateX(-3px)",
            }}
          >
            <LineChart
              data={{
                labels: [
                  "07/05/2023",
                  "08/05/2023",
                  "09/05/2023",
                  "10/05/2023",
                  "11/05/2023",
                  "12/05/2023",
                  "12/05/2023",
                ],
                datasets: [
                  {
                    label: "",
                    data: [1, 4, 2, 4, 6, 14, 24],
                    borderColor: "#474747",
                    borderWidth: 2,
                    fill: true,
                    // tension: 0.2,
                    backgroundColor: (context) => {
                      const chart = context.chart;
                      const { ctx, chartArea } = chart;
                      if (!chartArea) return;
                      const gradient = ctx.createLinearGradient(
                        0,
                        chartArea.bottom,
                        0,
                        chartArea.top,
                      );
                      gradient.addColorStop(1, "#000");
                      gradient.addColorStop(0, "rgba(255, 255, 255, 0)");

                      return gradient;
                    },
                    pointRadius: 5,
                  },
                ],
              }}
              options={{
                layout: { padding: 0 },
                plugins: {
                  legend: { display: false },
                  title: { display: false },
                  tooltip: {},
                },
                scales: {
                  y: {
                    display: false,
                    beginAtZero: false,
                    grace: 0,
                    ticks: { display: false },
                    grid: { display: false },
                  },
                  x: {
                    grid: { display: false },
                    ticks: { display: false, color: "#ddd" },
                    display: false,
                  },
                },
              }}
            />
          </div>
        </div>
        <div className="flex flex-col justify-between bg-[#ffffff] overflow-hidden rounded-xl shadow-lg shadow-black/10">
          <div className="flex w-full items-center justify-between p-3 pt-2 pb-0 gap-2">
            <h1 className="text-xs text-black/70 font-medium">Atendimentos</h1>
            <div className="flex items-center">
              <span className="font-semibold text-xl">21</span>
              <span className="text-[#66bc3e] text-sm">+90%</span>
            </div>
          </div>
          <div className="flex items-center -mt-0.5 mx-3 gap-1 text-gray-500">
            <BsCalendarWeek />
            <button className="flex bg-gray-100 border p-0.5 rounded-sm">
              <span className="text-[11px]">20/01 - 27/01</span>
            </button>
          </div>
          <div
            style={{
              width: "calc(100% + 10px)",
              transform: "translateX(-3px)",
            }}
          >
            <LineChart
              data={{
                labels: [
                  "07/05/2023",
                  "08/05/2023",
                  "09/05/2023",
                  "10/05/2023",
                  "11/05/2023",
                  "12/05/2023",
                  "12/05/2023",
                ],
                datasets: [
                  {
                    label: "",
                    data: [
                      1 * 32,
                      2 * 32,
                      6 * 32,
                      4 * 32,
                      6 * 32,
                      10 * 32,
                      24 * 32,
                    ],
                    borderColor: "#474747",
                    borderWidth: 2,
                    fill: true,
                    // tension: 0.2,
                    backgroundColor: (context) => {
                      const chart = context.chart;
                      const { ctx, chartArea } = chart;
                      if (!chartArea) return;
                      const gradient = ctx.createLinearGradient(
                        0,
                        chartArea.bottom,
                        0,
                        chartArea.top,
                      );
                      gradient.addColorStop(1, "#000");
                      gradient.addColorStop(0, "rgba(255, 255, 255, 0)");

                      return gradient;
                    },
                    pointRadius: 5,
                  },
                ],
              }}
              options={{
                layout: { padding: 0 },
                plugins: {
                  legend: { display: false },
                  title: { display: false },
                  tooltip: {},
                },
                scales: {
                  y: {
                    display: false,
                    beginAtZero: false,
                    grace: 0,
                    ticks: { display: false },
                    grid: { display: false },
                  },
                  x: {
                    grid: { display: false },
                    ticks: { display: false, color: "#ddd" },
                    display: false,
                  },
                },
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
