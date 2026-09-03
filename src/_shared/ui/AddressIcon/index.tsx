import { useMemo } from "react";
import { isAddress } from "viem";
import { MinusSquareOutlined } from "@ant-design/icons";
import { cn } from "@shared/lib/cn";
import { TAddress } from "@shared/lib/web3";
import { TSize, TWithClassname, TWithSize } from "@shared/lib/props";
import { createBlockie } from "./blockies";

import styles from "./AddressIcon.module.scss";

type TProps = TWithClassname &
  TWithSize & {
    address: TAddress;
  };

// cells is the grid the algorithm draws; scale is pixels per cell.
const toIconSize = (size: TSize) => {
  if (size === "small") {
    return { cells: 6, scale: 3 };
  }

  if (size === "large") {
    return { cells: 12, scale: 4 };
  }

  return { cells: 8, scale: 4 };
};

export const AddressIcon = ({
  address,
  size = "medium",
  className,
}: TProps) => {
  const { cells, scale } = toIconSize(size);

  const blockie = useMemo(
    () => (isAddress(address) ? createBlockie(address, cells) : null),
    [address, cells]
  );

  if (!blockie) {
    return <MinusSquareOutlined />;
  }

  const pixels = cells * scale;

  // Drawn as svg rects rather than a canvas, so it stays sharp on any display
  // and needs no ref or effect.
  return (
    <svg
      className={cn(styles.root, className)}
      width={pixels}
      height={pixels}
      viewBox={`0 0 ${cells} ${cells}`}
      shapeRendering="crispEdges"
      aria-hidden="true"
    >
      <rect width={cells} height={cells} fill={blockie.bgcolor} />
      {blockie.cells.map((cell, index) =>
        cell ? (
          <rect
            key={index}
            x={index % cells}
            y={Math.floor(index / cells)}
            width={1}
            height={1}
            fill={cell === 1 ? blockie.color : blockie.spotcolor}
          />
        ) : null
      )}
    </svg>
  );
};
