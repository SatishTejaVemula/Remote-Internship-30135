import { useNavigate } from "react-router-dom";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

const PageNavigation = ({ current }) => {
  const navigate = useNavigate();

  const pages = [
    "/pio",
    "/progress",
    "/mentor",
    "/profileinfo",
    "/tasks",
    "/management"
  ];

  const currentIndex = pages.indexOf(current);

  const goNext = () => {
    if (currentIndex < pages.length - 1) {
      navigate(pages[currentIndex + 1]);
    } else {
      navigate("/", { state: { scrollTo: "features" } });
    }
  };

  const goPrev = () => {
    if (currentIndex > 0) {
      navigate(pages[currentIndex - 1]);
    }
  };

  return (
    <>
      <div
        style={{
          ...styles.arrow,
          left: "20px",
          opacity: currentIndex === 0 ? 0.3 : 1,
          pointerEvents: currentIndex === 0 ? "none" : "auto",
        }}
        onClick={goPrev}
      >
        <FaChevronLeft />
      </div>

      <div
        style={{
          ...styles.arrow,
          right: "20px",
          opacity: currentIndex === pages.length - 1 ? 0.6 : 1,
          pointerEvents: "auto",
        }}
        onClick={goNext}
      >
        <FaChevronRight />
      </div>
    </>
  );
};

const styles = {
  arrow: {
    position: "fixed",
    top: "50%",
    transform: "translateY(-50%)",
    fontSize: "28px",
    color: "white",
    cursor: "pointer",
    background: "rgba(255,255,255,0.1)",
    padding: "12px",
    borderRadius: "50%",
    backdropFilter: "blur(10px)",
    zIndex: 1000,
    transition: "0.3s",
  },
};

export default PageNavigation;