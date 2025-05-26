import SingleStats from "./SingleStats";

const Stats = () => {
  return (
    <div>
      <h2 className="text-3xl text-whiteSecondary font-bold mb-7">Offer Performance Overview</h2>
      <div className="flex justify-start gap-x-20 max-[1800px]:flex-wrap gap-y-10 mr-1 max-[1352px]:gap-x-10 max-[1050px]:mr-5">
        <SingleStats title="Active Offers" value="15" />
        <SingleStats title="Total Redemptions" value="3,472" />
        <SingleStats title="Conversion Rate" value="12.5%" />
      </div>
    </div>
  );
};

export default Stats;
