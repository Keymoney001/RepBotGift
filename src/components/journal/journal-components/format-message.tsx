import { formatMessage } from '../../../utils/download';

const FormatMessage = ({ logType, extra, ...otherProps }) => {
    // Use stable transaction ID from extra data if available
    const message = formatMessage(logType, {
        ...extra,
        // Ensure we use the actual transaction ID from the contract data
        transaction_id: extra?.transaction_id || extra?.contract_id
    });

    return (
        <div {...otherProps}>
            {message}
        </div>
    );
};

export default FormatMessage;