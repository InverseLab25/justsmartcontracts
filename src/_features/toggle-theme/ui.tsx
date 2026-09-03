import { Button, Tooltip } from "antd";
import { MoonOutlined, SunOutlined } from "@ant-design/icons";
import { themeModel } from "@entities/theme";

export const ToggleThemeButton = () => {
  const { theme, toggle } = themeModel.useTheme();

  const isDark = theme === "dark";

  return (
    <Tooltip title={isDark ? "Switch to light mode" : "Switch to dark mode"}>
      <Button
        type="text"
        shape="circle"
        aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
        icon={isDark ? <SunOutlined /> : <MoonOutlined />}
        onClick={toggle}
      />
    </Tooltip>
  );
};
