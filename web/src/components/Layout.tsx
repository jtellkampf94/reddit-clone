import { Fragment } from "react";
import NavBar from "./NavBar";
import Wrapper, { WrapperVariant } from "./Wrapper";

interface LayoutProps {
  variant?: WrapperVariant;
}

const Layout: React.FC<LayoutProps> = ({ variant, children }) => {
  return (
    <Fragment>
      <NavBar />
      <Wrapper variant={variant}>{children}</Wrapper>
    </Fragment>
  );
};

export default Layout;
