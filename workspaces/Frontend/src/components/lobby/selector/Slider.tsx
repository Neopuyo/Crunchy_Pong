import ReactSlider from "react-slider";
import styles from "@/styles/lobby/selector/Slider.module.css";

type Props = {
  min: number;
  max: number;
  step: number;
  value: number;
  setValue: Function;
  adjust: number;
};

export default function Slider({
  min,
  max,
  step,
  value,
  setValue,
  adjust,
}: Props) {
  const handleChange = (value: number) => {
    setValue(value + adjust);
  };

  const renderThumb = (props: any, state: any) => (
    <div {...props} className={styles.sliderThumb} key={1}>
      {state.valueNow}
    </div>
  );

  return (
    <ReactSlider
      className={styles.slider}
      trackClassName={styles.sliderTrack}
      min={min}
      max={max}
      step={step}
      value={value - adjust}
      onChange={handleChange}
      renderThumb={renderThumb}
    />
  );
}
