import { ConfigProvider, theme as antdTheme } from "antd";
import { TWithChildren } from "@shared/lib/props";
import { useApplyTheme, useTheme } from "../model";

// antd components carry their own colors, so flipping our css variables alone
// would leave every Table, Modal and Select stuck in light mode.
export const ThemeProvider = ({ children }: TWithChildren) => {
  const { theme } = useTheme();

  useApplyTheme(theme);

  return (
    <ConfigProvider
      theme={{
        algorithm:
          theme === "dark" ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm,
      }}
    >
      {children}
    </ConfigProvider>
  );
};
