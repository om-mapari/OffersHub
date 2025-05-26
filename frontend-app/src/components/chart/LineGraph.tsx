import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from "chart.js";
import { useAppSelector } from "../../hooks";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const LineGraph = () => {
  const { darkMode } = useAppSelector((state) => state.darkMode);

  ChartJS.defaults.color = darkMode ? "#fff" : "#000";

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "top" as const,
        labels: {
          color: darkMode ? "#fff" : "#000",
        },
      },
      title: {
        display: true,
        text: "Monthly Approved Offers",
        color: darkMode ? "#fff" : "#000",
        font: {
          size: 18,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          color: darkMode ? "#fff" : "#000",
        },
        grid: {
          color: darkMode ? "#444" : "#ccc",
        },
      },
      x: {
        ticks: {
          color: darkMode ? "#fff" : "#000",
        },
        grid: {
          color: darkMode ? "#444" : "#ccc",
        },
      },
    },
  };

  const data = {
    labels: [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct"
    ],
    datasets: [
      {
        label: "Approved Offers",
        data: [5, 12, 9, 14, 18, 22, 25, 19, 21, 28],
        fill: true,
        backgroundColor: darkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.05)",
        borderColor: darkMode ? "#fff" : "#000",
        pointBackgroundColor: darkMode ? "#fff" : "#000",
        tension: 0.4,
        pointRadius: 4,
      },
    ],
  };

  return <Line data={data} options={options} />;
};

export default LineGraph;
