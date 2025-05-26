import React from "react";

const offers = [
  {
    id: 1,
    title: "10% Cashback on Amazon with Arrow Card",
    category: "Credit Card",
    status: "Active",
    createdAt: "2025-05-01",
  },
  {
    id: 2,
    title: "₹2000 Welcome Bonus on New Savings Account",
    category: "Savings",
    status: "Active",
    createdAt: "2025-04-15",
  },
  {
    id: 3,
    title: "0% Interest EMI on Electronics with Barclaycard",
    category: "Credit Card",
    status: "Expired",
    createdAt: "2025-03-05",
  },
  {
    id: 4,
    title: "5% Cashback on Utility Bill Payments",
    category: "Payments",
    status: "Active",
    createdAt: "2025-04-25",
  },
  {
    id: 5,
    title: "No Annual Fee on Arrow Card for 1st Year",
    category: "Credit Card",
    status: "Active",
    createdAt: "2025-02-28",
  },
];


const OfferTable = () => {
  return (
    <div className="px-4 sm:px-6 lg:px-8 mt-6">
      <div className="overflow-x-auto rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 text-sm">
          <thead className="bg-gray-100 dark:bg-blackSecondary">
            <tr>
              <th className="px-6 py-3 text-left font-semibold text-gray-700 dark:text-whiteSecondary">Offer Title</th>
              <th className="px-6 py-3 text-left font-semibold text-gray-700 dark:text-whiteSecondary">Category</th>
              <th className="px-6 py-3 text-left font-semibold text-gray-700 dark:text-whiteSecondary">Status</th>
              <th className="px-6 py-3 text-left font-semibold text-gray-700 dark:text-whiteSecondary">Created At</th>
              <th className="px-6 py-3 text-left font-semibold text-gray-700 dark:text-whiteSecondary">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-blackPrimary divide-y divide-gray-200 dark:divide-gray-700">
            {offers.map((offer) => (
              <tr key={offer.id}>
                <td className="px-6 py-4 text-gray-800 dark:text-whiteSecondary">{offer.title}</td>
                <td className="px-6 py-4 text-gray-600 dark:text-gray-400">{offer.category}</td>
                <td className="px-6 py-4">
                  <span
                    className={`px-3 py-1 inline-flex text-xs font-medium rounded-full ${
                      offer.status === "Active"
                        ? "bg-green-100 text-green-800 dark:bg-green-700 dark:text-white"
                        : "bg-red-100 text-red-800 dark:bg-red-700 dark:text-white"
                    }`}
                  >
                    {offer.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-gray-600 dark:text-gray-400">{offer.createdAt}</td>
                <td className="px-6 py-4">
                  <button className="text-indigo-600 hover:underline dark:text-indigo-400">Edit</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default OfferTable;
