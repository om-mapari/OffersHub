import { ImageUpload, InputWithLabel, Sidebar } from "../components";
import { HiOutlineSave } from "react-icons/hi";
import { Link } from "react-router-dom";
import { AiOutlineSave } from "react-icons/ai";
import SimpleInput from "../components/SimpleInput";
import TextAreaInput from "../components/TextAreaInput";
import SelectInput from "../components/SelectInput";
import { offerTypeList, notificationChannelList } from "../utils/data";

const CreateOffer = () => {
  return (
    <div className="h-auto border-t border-blackSecondary border-1 flex dark:bg-blackPrimary bg-whiteSecondary">
      <Sidebar />
      <div className="hover:bg-blackPrimary bg-whiteSecondary w-full ">
        <div className="dark:bg-blackPrimary bg-whiteSecondary py-10">
          <div className="px-4 sm:px-6 lg:px-8 pb-8 border-b border-gray-800 flex justify-between items-center max-sm:flex-col max-sm:gap-5">
            <div className="flex flex-col gap-3">
              <h2 className="text-3xl font-bold leading-7 dark:text-whiteSecondary text-blackPrimary">
                Create New Offer
              </h2>
            </div>
            <div className="flex gap-x-2 max-[370px]:flex-col max-[370px]:gap-2 max-[370px]:items-center">
              <button className="dark:bg-blackPrimary bg-whiteSecondary border border-gray-600 w-48 py-2 text-lg dark:hover:border-gray-500 hover:border-gray-400 duration-200 flex items-center justify-center gap-x-2">
                <AiOutlineSave className="dark:text-whiteSecondary text-blackPrimary text-xl" />
                <span className="dark:text-whiteSecondary text-blackPrimary font-medium">
                  Save Draft
                </span>
              </button>
              <Link
                to="/offers"
                className="dark:bg-whiteSecondary bg-blackPrimary w-48 py-2 text-lg dark:hover:bg-white hover:bg-black duration-200 flex items-center justify-center gap-x-2"
              >
                <HiOutlineSave className="dark:text-blackPrimary text-whiteSecondary text-xl" />
                <span className="dark:text-blackPrimary text-whiteSecondary font-semibold">
                  Publish Offer
                </span>
              </Link>
            </div>
          </div>

          {/* Create Offer Form Section */}
          <div className="px-4 sm:px-6 lg:px-8 pb-8 pt-8 grid grid-cols-2 gap-x-10 max-xl:grid-cols-1 max-xl:gap-y-10">
            {/* left div */}
            <div>
              <h3 className="text-2xl font-bold leading-7 dark:text-whiteSecondary text-blackPrimary">
                Basic Information
              </h3>

              <div className="mt-4 flex flex-col gap-5">
                <InputWithLabel label="Offer Title">
                  <SimpleInput type="text" placeholder="Enter offer title..." />
                </InputWithLabel>

                <InputWithLabel label="Description">
                  <TextAreaInput
                    placeholder="Enter offer description..."
                    rows={4}
                    cols={50}
                  />
                </InputWithLabel>

                <InputWithLabel label="Offer Type">
                  <SelectInput selectList={offerTypeList} />
                </InputWithLabel>

                <InputWithLabel label="Offer Value">
                  <SimpleInput
                    type="number"
                    placeholder="Enter offer value..."
                  />
                </InputWithLabel>

                <div className="grid grid-cols-2 gap-x-5 max-[500px]:grid-cols-1 gap-y-5">
                  <InputWithLabel label="Start Date">
                    <SimpleInput type="date" />
                  </InputWithLabel>
                  <InputWithLabel label="End Date">
                    <SimpleInput type="date" />
                  </InputWithLabel>
                </div>
              </div>

              <h3 className="text-2xl font-bold leading-7 dark:text-whiteSecondary text-blackPrimary mt-16">
                Notification Settings
              </h3>
              <div className="mt-4 flex flex-col gap-5">
                <InputWithLabel label="Notification Channels">
                  <SelectInput selectList={notificationChannelList} />
                </InputWithLabel>

                <InputWithLabel label="Notification Date">
                  <SimpleInput type="datetime-local" />
                </InputWithLabel>
              </div>

              <h3 className="text-2xl font-bold leading-7 dark:text-whiteSecondary text-blackPrimary mt-16">
                Business Summary
              </h3>
              <div className="mt-4 flex flex-col gap-5">
                <InputWithLabel label="Expected Impact (₹)">
                  <SimpleInput
                    type="number"
                    placeholder="Enter expected revenue impact..."
                  />
                </InputWithLabel>
                <InputWithLabel label="Summary Notes">
                  <TextAreaInput
                    placeholder="Enter business summary notes..."
                    rows={3}
                    cols={50}
                  />
                </InputWithLabel>
              </div>
            </div>

            {/* right div */}
            <div>
              <h3 className="text-2xl font-bold leading-7 dark:text-whiteSecondary text-blackPrimary">
                Attachments
              </h3>
              <ImageUpload />

              <h3 className="text-2xl font-bold leading-7 dark:text-whiteSecondary text-blackPrimary mt-16">
                Approval Comments
              </h3>
              <div className="mt-4 flex flex-col gap-5">
                <InputWithLabel label="Comments (Optional)">
                  <TextAreaInput
                    placeholder="Add approval notes or comments..."
                    rows={4}
                    cols={50}
                  />
                </InputWithLabel>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default CreateOffer;
