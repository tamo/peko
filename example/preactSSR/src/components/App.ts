import { useState, useEffect } from "npm:preact/hooks";
import { html } from "npm:htm/preact";
import List from "./List.ts";
import { useLocalState } from "../hooks/localstate.ts";

const App = () => {
  const [dataArray, setDataArray] = useLocalState("dataArray");
  const [latestEvent, setLatestEvent] = useState(0);

  useEffect(() => {
    const sse = new EventSource("/sse");
    sse.onmessage = (e) => {
      const eventData = JSON.parse(e.data);
      setLatestEvent(eventData.detail);
      console.log(e);
    };
    sse.onerror = (e) => {
      sse.close();
      console.log(e);
    };
    document.body.addEventListener("unload", () => sse.close());
    return () => sse.close();
  }, []);

  return html`
    <div style="margin: 2rem 0;">
      <p><strong>Latest random number from server: </strong> ${latestEvent}</p>

      <${List} data=${dataArray} />

      <button
        style=${btnLgStyle}
        onClick=${() =>
          setDataArray((dataArray: string[]) => [
            ...dataArray,
            `Item ${dataArray.length}`,
          ])}
      >
        add item
      </button>
      <button
        style=${btnLgStyle}
        onClick=${() =>
          setDataArray((dataArray: string[]) =>
            dataArray.slice(0, dataArray.length - 1)
          )}
      >
        remove item
      </button>
    </div>
  `;
};

const btnLgStyle = `
    margin: 0.5rem;  
    padding: 0.5rem;
    font-size: 1rem;
`;

export default App;
