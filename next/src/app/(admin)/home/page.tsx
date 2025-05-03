import { PersonCombobox } from "~/app/_components/Combobox/Person";
import { VehicleCombobox } from "~/app/_components/Combobox/Vehicle";

const HomePage = async () => {
	return (
		<>
			<PersonCombobox />
			<VehicleCombobox />
		</>
	);
};

export default HomePage;
