import type { StorybookConfig } from "@storybook/nextjs";

const config: StorybookConfig = {
  stories: ["../src/components/**/*.stories.@(js|jsx|mjs|ts|tsx)"],
  addons: [
    "@storybook/addon-links",
    "@storybook/addon-essentials",
    "@storybook/addon-interactions",
    "@storybook/addon-a11y",
  ],
  framework: {
    name: "@storybook/nextjs",
    options: {},
  },
  typescript: {
    check: false,
    reactDocgen: "react-docgen-typescript",
    reactDocgenTypescriptOptions: {
      shouldExtractLiteralValuesFromEnum: true,
      propFilter: (prop) =>
        prop.parent ? !/node_modules/.test(prop.parent.fileName) : true,
    },
  },
  webpackFinal: async (config) => {
    // Ensure CSS files are processed with PostCSS
    if (config.module && config.module.rules) {
      const cssRule = config.module.rules.find(
        (rule: any) => rule.test && rule.test.toString().includes("css"),
      );

      if (cssRule && cssRule.use) {
        // Add postcss-loader to the existing CSS rule
        cssRule.use.push({
          loader: "postcss-loader",
          options: {
            postcssOptions: {
              plugins: [require("@tailwindcss/postcss")],
            },
          },
        });
      }
    }

    return config;
  },
};

export default config;
