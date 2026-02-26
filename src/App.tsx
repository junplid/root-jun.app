import { Provider } from "./components/ui/provider";
import { RoutesApp } from "./Routes";

export default function App() {
  return (
    <Provider>
      <RoutesApp />
    </Provider>
  );
}
