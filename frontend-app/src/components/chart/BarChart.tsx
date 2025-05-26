import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { useAppSelector } from "../../hooks";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const BarChart = () => {
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
        text: "Offers Created by Category",
        color: darkMode ? "#fff" : "#000",
        font: {
          size: 18,
        },
      },
    },
    scales: {
      x: {
        ticks: {
          color: darkMode ? "#fff" : "#000",
        },
        grid: {
          color: darkMode ? "#444" : "#ccc",
        },
      },
      y: {
        beginAtZero: true,
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
      "Credit Cards", "Loans", "Savings", "Insurance", "Mutual Funds", "Investments"
    ],
    datasets: [
      {
        label: "Offers Created",
        data: [25, 18, 12, 9, 15, 22],
        backgroundColor: darkMode ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.1)",
        borderColor: darkMode ? "#fff" : "#000",
        borderWidth: 1,
        borderRadius: 4,
      },
    ],
  };

  return <Bar options={options} data={data} />;
};

export default BarChart;
