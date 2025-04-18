import { PersonCombobox } from "~/app/_components/Combobox/Person";
import { AccountView } from "../_components/AccountView";

const HomePage = async () => {
	return (
		<>
			<PersonCombobox />
			<AccountView />
		</>
	);
};

export default HomePage;
