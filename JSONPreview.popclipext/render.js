ObjC.import('Foundation');

function run(argv) {
  var text = ObjC.unwrap($.NSProcessInfo.processInfo.environment.objectForKey('POPCLIP_TEXT')) || '';
  var encoded = ObjC.unwrap($(text).dataUsingEncoding($.NSUTF8StringEncoding).base64EncodedStringWithOptions(0));
  var template = $.NSString.stringWithContentsOfFileEncodingError(argv[0], $.NSUTF8StringEncoding, null);
  if (!template) throw new Error('无法读取 JSON 预览模板');
  return ObjC.unwrap(template).replace('__JSON_BASE64__', encoded);
}
