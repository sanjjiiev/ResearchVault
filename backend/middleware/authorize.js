// Access Control Matrix
const permissions = {
    student:  ['upload_paper', 'view_own_paper'],
    faculty:  ['view_assigned_paper', 'submit_review'],
    admin:    ['view_all_papers', 'publish_decision', 'manage_users']
};

exports.checkPermission = (requiredPermission) => {
    return (req, res, next) => {
        const userRole = req.user.role; 

        if (!permissions[userRole] || !permissions[userRole].includes(requiredPermission)) {
            console.warn(` ACCESS DENIED: User ${req.user.email} (${userRole}) tried to ${requiredPermission}`);
            return res.status(403).json({ 
                error: 'Forbidden', 
                message: 'You do not have permission to perform this action.' 
            });
        }
        next();
    };
};