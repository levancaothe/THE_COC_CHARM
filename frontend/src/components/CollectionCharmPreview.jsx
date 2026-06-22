import "../pages/MyDesignsPage.css";
import { getProxyImageUrl, isPendantCharm } from "../utils/imageProxy";

const normalizeCollectionCharms = (charms = []) =>
  charms
    .map((entry) => entry?.charm || entry)
    .filter(Boolean);

export default function CollectionCharmPreview({
  charms = [],
  ariaLabel = "Danh sách charm trong bộ sưu tập",
  variant = "card",
}) {
  const previewCharms = normalizeCollectionCharms(charms);
  const hasPendantCharm = previewCharms.some(isPendantCharm);
  const isDetailVariant = variant === "detail";
  const previewPaddingBottom = hasPendantCharm
    ? isDetailVariant
      ? "150px"
      : "96px"
    : "16px";
  const slotSize = isDetailVariant
    ? { width: "36px", height: "32px" }
    : { width: "36px", height: "32px" };
  const charmSize = isDetailVariant
    ? { width: "36px", height: "32px" }
    : { width: "36px", height: "32px" };
  const pendantSize = isDetailVariant
    ? {
        width: "120px",
        height: "156px",
        translateY: "-35px",
      }
    : {
        width: "78px",
        height: "102px",
        translateY: "-34px",
      };

  return (
    <div
      className={`my-design-preview collection-charm-preview collection-charm-preview--${variant}`}
      aria-label={ariaLabel}
      style={{
        overflow: "visible",
        paddingBottom: previewPaddingBottom,
        position: "relative",
      }}
    >
      <div className="my-design-band">
        {previewCharms.map((charmObj, index) => {
          const isPendant = isPendantCharm(charmObj);

          return (
            <div
              key={`${charmObj?._id || charmObj?.name || index}`}
              className={`my-design-slot ${isPendant ? "my-design-slot--pendant" : ""}`}
              style={slotSize}
            >
              {charmObj?.image ? (
                <>
                  <img
                    src={getProxyImageUrl(charmObj.image)}
                    alt=""
                    className="my-design-charm-img"
                    style={{
                      width: charmSize.width,
                      height: charmSize.height,
                      display: isPendant ? "none" : "block",
                    }}
                  />
                  {isPendant && (
                    <img
                      src={getProxyImageUrl(charmObj.image)}
                      alt=""
                      className="my-design-pendant-preview"
                      style={{
                        width: pendantSize.width,
                        height: pendantSize.height,
                        transform: `translate(-50%, ${pendantSize.translateY})`,
                      }}
                    />
                  )}
                </>
              ) : (
                <span
                  className="my-design-charm-img"
                  style={{
                    width: charmSize.width,
                    height: charmSize.height,
                  }}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
