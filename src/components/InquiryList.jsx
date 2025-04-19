export default function InquiryList({ inquiries }) {
  return (
    <div className="space-y-6">
      {inquiries.length === 0 && (
        <div className="p-6 text-center border border-gray-200 rounded-lg bg-gray-50 dark:bg-gray-800 dark:border-gray-700">
          <p className="text-gray-500 dark:text-gray-400">No inquiries found.</p>
        </div>
      )}
      
      {inquiries.map((inq) => (
        <div 
          key={inq._id} 
          className="p-5 border border-gray-200 rounded-lg bg-white shadow-sm transition-all hover:shadow-md dark:bg-gray-800 dark:border-gray-700"
        >
          <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4 mb-4">
            <div>
              <h3 className="font-medium text-gray-900 dark:text-white">{inq.name}</h3>
              <p className="text-sm text-blue-600 dark:text-blue-400">{inq.email}</p>
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 md:text-right">
              Submitted: {new Date(inq.createdAt).toLocaleString()}
            </div>
          </div>
          
          {inq.type === 'PRODUCT' && (
            <div className="mb-4 p-3 bg-gray-50 rounded-md dark:bg-gray-700">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Product</p>
                  <p className="font-medium dark:text-gray-200">{inq.product_name}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Part #</p>
                  <p className="font-mono dark:text-gray-200">{inq.part_number}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Quantity</p>
                  <p className="font-medium dark:text-gray-200">{inq.quantity}</p>
                </div>
              </div>
            </div>
          )}
          
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Message</p>
            <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line">{inq.message || inq.comment}</p>
          </div>
        </div>
      ))}
    </div>
  );
}