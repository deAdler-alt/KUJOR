extends Node

signal dialogue_started
signal dialogue_finished
signal line_shown(speaker: String, text: String)

const TYPEWRITER_CHARS_PER_SEC := 40.0

var is_active: bool = false
var _dialogue_box: Node = null
var _current_lines: Array = []
var _line_index: int = 0
var _char_index: int = 0
var _typewriter_timer: float = 0.0
var _current_speaker: String = ""
var _waiting_advance: bool = false
var _full_line: String = ""
var _on_finish_callback: Callable = Callable()


func register_dialogue_box(box: Node) -> void:
	_dialogue_box = box
	if _dialogue_box:
		_dialogue_box.hide_box()


func _process(delta: float) -> void:
	if not is_active or _dialogue_box == null:
		return
	if _waiting_advance:
		return
	_typewriter_timer += delta
	var chars_to_show := int(_typewriter_timer * TYPEWRITER_CHARS_PER_SEC)
	if chars_to_show > _char_index:
		_char_index = mini(chars_to_show, _full_line.length())
		_dialogue_box.set_text(_full_line.substr(0, _char_index))
		if _char_index >= _full_line.length():
			_waiting_advance = true
			_dialogue_box.show_advance_hint(true)


func start_dialogue(speaker: String, lines: Array, on_finish: Callable = Callable()) -> void:
	if is_active:
		return
	is_active = true
	_current_lines = lines
	_line_index = 0
	_on_finish_callback = on_finish
	GameState.set_player_locked(true)
	dialogue_started.emit()
	_show_current_line(speaker)


func start_from_json(dialogue_id: String, json_path: String, on_finish: Callable = Callable()) -> void:
	var data := _load_json(json_path)
	if data.is_empty():
		return
	var entry: Dictionary = data.get(dialogue_id, {})
	if entry.is_empty():
		push_warning("DialogueManager: brak id '%s' w %s" % [dialogue_id, json_path])
		return
	var speaker: String = entry.get("speaker", "???")
	var lines: Array = entry.get("lines", [])
	start_dialogue(speaker, lines, on_finish)


func start_dynamic(speaker: String, lines: Array, on_finish: Callable = Callable()) -> void:
	start_dialogue(speaker, lines, on_finish)


func advance() -> void:
	if not is_active:
		return
	if not _waiting_advance:
		# Skip typewriter
		_char_index = _full_line.length()
		if _dialogue_box:
			_dialogue_box.set_text(_full_line)
		_waiting_advance = true
		_dialogue_box.show_advance_hint(true)
		return
	_line_index += 1
	if _line_index >= _current_lines.size():
		_end_dialogue()
	else:
		_show_current_line(_current_speaker)


func _show_current_line(speaker: String) -> void:
	_current_speaker = speaker
	_full_line = str(_current_lines[_line_index])
	_char_index = 0
	_typewriter_timer = 0.0
	_waiting_advance = false
	if _dialogue_box:
		_dialogue_box.show_box(speaker, "")
		_dialogue_box.show_advance_hint(false)
	line_shown.emit(speaker, _full_line)


func _end_dialogue() -> void:
	is_active = false
	if _dialogue_box:
		_dialogue_box.hide_box()
	GameState.set_player_locked(false)
	dialogue_finished.emit()
	if _on_finish_callback.is_valid():
		_on_finish_callback.call()


func _load_json(path: String) -> Dictionary:
	if not FileAccess.file_exists(path):
		push_error("DialogueManager: brak pliku %s" % path)
		return {}
	var file := FileAccess.open(path, FileAccess.READ)
	var text := file.get_as_text()
	file.close()
	var parsed = JSON.parse_string(text)
	if typeof(parsed) != TYPE_DICTIONARY:
		return {}
	return parsed
