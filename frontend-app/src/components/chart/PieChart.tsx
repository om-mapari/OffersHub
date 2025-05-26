import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, Tooltip, Legend, ArcElement } from "chart.js";
import { useAppSelector } from "../../hooks";

ChartJS.register(Tooltip, Legend, ArcElement);

const PieChart = () => {
  const { darkMode } = useAppSelector((state) => state.darkMode);

  ChartJS.defaults.color = darkMode ? "#fff" : "#000";

  const options = {
    plugins: {
      legend: {
        position: "right",
        labels: {
          color: darkMode ? "#fff" : "#000",
        },
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            const label = context.label || "";
            const value = context.raw || 0;
            return `${label}: ${value} offers`;
          },
        },
      },
    },
  };

  const data = {
    labels: ["Active", "Upcoming", "Expired", "Draft", "Paused"],
    datasets: [
      {
        label: "Offer Status",
        data: [25, 10, 15, 8, 5],
        backgroundColor: [
          "rgba(255,255,255, 1)",   // Active
          "rgba(255,255,255, 0.8)", // Upcoming
          "rgba(255,255,255, 0.6)", // Expired
          "rgba(255,255,255, 0.4)", // Draft
          "rgba(255,255,255, 0.2)", // Paused
        ],
        hoverOffset: 10,
      },
    ],
  };

  return <Pie data={data} options={options} />;
};

export default PieChart;
